const asyncHandler = require('express-async-handler');
const validator = require('validator');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const qrcode = require('qrcode');

const ApiResponse = require('../utils/apiResponse');
const User = require('../models/user.model');
const HttpError = require('../utils/httpError');
const { generateSecretBase32ByUser } = require('../utils/generateSecret');
const Session = require('../models/session.model');
const redisClient = require('../config/redis');
const { MfaMethod } = require('../config/constant');

const me = asyncHandler(async (req, res) => {
	const user = await User.findByPk(req.tokenDecoded.userId, { attributes: { exclude: ['passwordHash'] } });

	return ApiResponse.success(res, 200, undefined, user);
});

const update = asyncHandler(async (req, res) => {
	const { email, phoneNumber, password } = req.body;

	// validate req
	{
		if (email && !validator.isEmail(email)) throw new HttpError(400, 'Email invalid!');
		if (phoneNumber && validator.isEmpty(phoneNumber)) throw new HttpError(400, 'Phone number invalid!');
		// if (phoneNumber && !validator.isMobilePhone(phoneNumber, 'vi-VN', { strictMode: false }))
		// 	throw new HttpError(400, 'Phone number invalid!');
		if (password && !validator.isLength(password, { min: 1 })) throw new HttpError(400, 'Password must not empty!');
	}

	// vaidate in db
	{
		const user = await User.findOne({
			where: {
				[Op.or]: [email && { email: email }, phoneNumber && { phoneNumber: phoneNumber }],
			},
		});

		if (user) {
			if (user.email === email) throw new HttpError(400, 'This email already used.');
			else if (user.phoneNumber === phoneNumber) throw new HttpError(400, 'This phone number already used.');
		}
	}

	const user = await User.findByPk(req.tokenDecoded.userId);
	if (!user) throw new HttpError(404, 'Not found user!');

	const passwordHash = password ? bcrypt.hashSync(password, bcrypt.genSaltSync(10)) : undefined;

	user.email = email ?? user.email;
	user.phoneNumber = phoneNumber ?? user.phoneNumber;
	user.passwordHash = passwordHash ?? user.passwordHash;

	await user.save();

	return ApiResponse.success(res, 200, undefined, user);
});

const listSessions = asyncHandler(async (req, res) => {
	let sessions = await Session.findAll({
		where: { userId: req.tokenDecoded.userId },
		order: [
            ['id', 'DESC'],
        ],
		attributes: { exclude: ['userId'] },
	});

	sessions = sessions.map((session) => ({
		...session.toJSON(),
		isCurrentSession: session.refreshTokenHash == req.tokenDecoded.refreshTokenHash,
		refreshTokenHash: undefined,
	}));

	return ApiResponse.success(res, 200, undefined, sessions);
});

const revokeSession = asyncHandler(async (req, res) => {
	const { sessionId } = req.params;

	// validate req
	if (!sessionId || !validator.isNumeric(sessionId)) throw new HttpError(404, 'Invalid sessionId');

	const session = await Session.findByPk(sessionId);
	session.isActive = false;
	await session.save();

	const now = new Date();
	const timeRemain = Math.ceil((session.expiredAt.getTime() - now.getTime()) / 1000);
	await redisClient.setEx(`blacklist:refresh_tokens:${session.refreshTokenHash}`, timeRemain > 0 ? timeRemain : 0, '1');

	return ApiResponse.success(res, 200, "Revoke Session successed.");
});

const mfaEnabled = asyncHandler(async (req, res) => {
	const { mfaMethod } = req.body;

	// validate req
	if (!mfaMethod || !validator.isIn(mfaMethod, Object.values(MfaMethod))) throw new HttpError(400, 'Invalid mfaType!');

	const user = await User.findByPk(req.tokenDecoded.userId);
	if (!user) throw new HttpError(404, 'Not found user!');

	const mfaMethods = [...user.mfaMethods] || [];
	if (!mfaMethods.includes(mfaMethod)) mfaMethods.push(mfaMethod);

	user.mfaMethods = mfaMethods;
	await user.save();

	return ApiResponse.success(res, 200, undefined);
});

const mfaDisabled = asyncHandler(async (req, res) => {
	const { mfaMethod } = req.body;

	// validate req
	if (!mfaMethod || !validator.isIn(mfaMethod, Object.values(MfaMethod))) throw new HttpError(400, 'Invalid mfaType!');

	const user = await User.findByPk(req.tokenDecoded.userId);
	if (!user) throw new HttpError(404, 'Not found user!');

	const mfaMethods = [...user.mfaMethods] || [];
	const index = mfaMethods.indexOf(mfaMethod);
	if (index !== -1) mfaMethods.splice(index, 1);

	user.mfaMethods = mfaMethods;
	await user.save();

	return ApiResponse.success(res, 200, undefined);
});

const mfaAuthenticatorSetup = asyncHandler(async (req, res) => {
	const user = await User.findByPk(req.tokenDecoded.userId);
	if (!user) throw new HttpError(404, 'Not found user!');

	const secretBase32 = generateSecretBase32ByUser(user);
	const otpauthUrl = `otpauth://totp/${user.email}?secret=${secretBase32}&issuer=MfaApp`;
	const qrCodeUrl = await qrcode.toDataURL(otpauthUrl);

	return ApiResponse.success(res, 200, undefined, { secret: secretBase32, qrCodeUrl });
});

module.exports = { me, update, listSessions, revokeSession, mfaEnabled, mfaDisabled, mfaAuthenticatorSetup };
