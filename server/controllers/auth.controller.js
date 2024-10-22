const asyncHandler = require('express-async-handler');
const validator = require('validator');
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');
const { Op } = require('sequelize');

const User = require('../models/user.model');
const Session = require('../models/session.model');
const HttpError = require('../utils/httpError');
const ApiResponse = require('../utils/apiResponse');
const redisClient = require('../config/redis');
const twilioClient = require('../config/twilio');
const env = require('../config/env');
const generateTokenAndSession = require('../utils/generateTokenAndSession');
const generateOTP = require('../utils/generateOTP');
const { generateToken, verifyToken, hashToken, getTokenRemainingTime } = require('../utils/jwt');
const { generateSecretBase32ByUser } = require('../utils/generateSecret');
const { sendEmail } = require('../services/email.service');
const { EmailType, MfaMethod } = require('../config/constant');
const { parseDuration, parseDurationToHumanFormat } = require('../utils/time');

const register = asyncHandler(async (req, res) => {
	const { email, phoneNumber, password } = req.body;

	// validate req
	{
		if (!validator.isEmail(email)) throw new HttpError(400, 'Email invalid!');
		// if (!validator.isMobilePhone(phoneNumber, 'vi-VN', { strictMode: false }))
		// 	throw new HttpError(400, 'Phone number invalid!');
		if (!password || !validator.isLength(password, { min: 1 })) throw new HttpError(400, 'Password must not empty!');
	}

	// vaidate in db
	{
		const user = await User.findOne({
			where: {
				[Op.or]: [{ email: email }, { phoneNumber: phoneNumber }],
			},
		});

		if (user) {
			if (user.email === email) throw new HttpError(400, 'This email already used.');
			else if (user.phoneNumber === phoneNumber) throw new HttpError(400, 'This phone number already used.');
		}
	}

	const passwordHash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

	await User.create({ email, phoneNumber, passwordHash });

	return ApiResponse.success(res, 200, 'Register successed.');
});

const login = asyncHandler(async (req, res) => {
	const { email, password } = req.body;

	// validate req
	if (!validator.isEmail(email)) throw new HttpError(400, 'Email invalid!');
	if (!password || !validator.isLength(password, { min: 1 })) throw new HttpError(400, 'Password must not empty!');

	// vaidate in db
	const user = await User.findOne({ where: { email: email } });
	if (!user) throw new HttpError(400, 'Email or Password incorrect.');

	if (!bcrypt.compareSync(password, user.passwordHash)) throw new HttpError(400, 'Email or Password incorrect.');

	if (user.mfaMethods.length > 0) {
		const mfaToken = generateToken({ userId: user.id }, 3600); // 1 hour
		return ApiResponse.success(res, 200, 'MAF required', { mfaRequired: true, mfaMethods: user.mfaMethods ?? [], mfaToken });
	}

	const { refreshToken, accessToken } = await generateTokenAndSession(req, user);
	return ApiResponse.success(res, 200, 'Login Success', { accessToken, refreshToken });
});

const logout = asyncHandler(async (req, res) => {
	const { refreshToken } = req.body;

	// valdate req
	if (!refreshToken || !validator.isLength(refreshToken, { min: 1 })) throw new HttpError(400, 'refreshToken must not empty!');

	const refreshTokenHash = hashToken(refreshToken);
	await redisClient.setEx(`blacklist:refresh_tokens:${refreshTokenHash}`, getTokenRemainingTime(refreshToken), '1');

	// update sesssion => inactive
	await Session.update({ isActive: false }, { where: { refreshTokenHash: refreshTokenHash } });

	return ApiResponse.success(res, 200, 'Logout success.');
});

const refreshAccessToken = asyncHandler(async (req, res) => {
	const { refreshToken } = req.body;

	// valdate req
	if (!refreshToken || !validator.isLength(refreshToken, { min: 1 })) throw new HttpError(400, 'refreshToken must not empty!');

	// check in blacklist
	const refreshTokenHash = hashToken(refreshToken);
	const isTokenValid = !(await redisClient.get(`blacklist:refresh_tokens:${refreshTokenHash}`));
	if (!isTokenValid) throw new HttpError(400, 'Token invalid!');

	// validate token
	const decoded = verifyToken(refreshToken);

	// validate in db
	const user = await User.findByPk(decoded.userId);
	if (!user) throw new HttpError(500, 'Not found user!');

	const accessToken = generateToken({ userId: user.id }, 30000); // 5 minutes

	return ApiResponse.success(res, 200, undefined, { accessToken });
});

const forgotPassword = asyncHandler(async (req, res) => {
	const { email } = req.body;

	// validate req
	if (!validator.isEmail(email)) throw new HttpError(400, 'Email invalid!');

	// validate in DB
	const user = await User.findOne({ where: { email: email } });
	if (!user) throw new HttpError(500, 'Not found user!');

	// send email reset password
	const token = generateToken({ userId: user.id }, parseDuration(env.JWT_RESET_PASSWORD_EXPRY_TIME) / 1000);

	await sendEmail(user.email, EmailType.RESET_PASSWORD, {
		email: user.email,
		resetLink: `${env.APP_PUBLIC_URL}/reset-password?token=${token}`,
		expiryTime: parseDurationToHumanFormat(env.JWT_RESET_PASSWORD_EXPRY_TIME),
	});

	return ApiResponse.success(res, 200, undefined, { token });
});

const resetPassword = asyncHandler(async (req, res) => {
	const { token, newPassword } = req.body;

	// validate req
	if (!token || !validator.isLength(token, { min: 1 })) throw new HttpError(400, 'refreshToken must not empty!');
	if (!newPassword || !validator.isLength(newPassword, { min: 1 })) throw new HttpError(400, 'newPassword must not empty!');

	// check token in black list
	const tokenHash = hashToken(token);
	const isTokenValid = !(await redisClient.get(`blacklist:reset_password_tokens:${tokenHash}`));
	if (!isTokenValid) throw new HttpError(400, 'Token invalid!');

	// validate token
	const decoded = verifyToken(token);

	const user = await User.findByPk(decoded.userId);
	if (!user) throw new HttpError(404, 'Not found user!');

	const passwordHash = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10));
	user.passwordHash = passwordHash;
	user.mfaMethods = [];

	await user.save();
	await redisClient.setEx(`blacklist:reset_password_tokens:${tokenHash}`, getTokenRemainingTime(token), '1');

	return ApiResponse.success(res, 200, undefined);
});

const mfaSmsSend = asyncHandler(async (req, res) => {
	const expiryTimeHumanFormat = parseDurationToHumanFormat(env.JWT_CONFIRM_LOGIN_EXPRY_TIME);
	const expiryTime = Math.ceil(parseDuration(env.JWT_CONFIRM_LOGIN_EXPRY_TIME) / 1000);

	const user = await User.findByPk(req.tokenDecoded.userId);
	if (!user) throw new HttpError(404, 'Not found user!');

	const otp = generateOTP();
	const otpHash = hashToken(`${user.id}-${otp}`);

	await redisClient.setEx(`otp:sms:${otpHash}`, expiryTime, '1');

	const response = await twilioClient.messages.create({
		body: `Your login code is: ${otp}. This code will expire in ${expiryTimeHumanFormat} minutes. If you did not request this, please ignore this message`,
		// to: '+84' + user.phoneNumber.slice(1),
		to: user.phoneNumber, // only work with +61485977611
		from: env.TWILIO_SMS_NUMBER,
	});

	console.log(otp);

	return ApiResponse.success(res, 200, undefined);
});

const mfaEmailSend = asyncHandler(async (req, res) => {
	// validate user in DB
	const user = await User.findByPk(req.tokenDecoded.userId);
	if (!user) throw new HttpError(404, 'Not found user!');

	// send email confirm login
	const token = generateToken(
		{ userId: user.id, mfaMethod: MfaMethod.Email },
		parseDuration(env.JWT_CONFIRM_LOGIN_EXPRY_TIME) / 1000,
	);

	await sendEmail(user.email, EmailType.CONFIRM_LOGIN, {
		email: user.email,
		ipAddress: req.ip,
		device: `${req.useragent?.browser} on ${req.useragent?.os}`,
		loginLink: `${env.APP_PUBLIC_URL}/mfa/email?token=${token}`,
		expiryTime: parseDurationToHumanFormat(env.JWT_CONFIRM_LOGIN_EXPRY_TIME),
	});

	return ApiResponse.success(res, 200, undefined, { token });
});

const mfaVerify = asyncHandler(async (req, res) => {
	const { mfaMethod, code, token } = req.body;

	// validate user in DB
	const user = await User.findByPk(req.tokenDecoded.userId);
	if (!user) throw new HttpError(404, 'Not found user!');

	// validate req
	if (user.mfaMethods.includes(mfaMethod) === -1) throw new HttpError(400, 'MfaMethod invalid!');
	if (mfaMethod == MfaMethod.Email) {
		if (!token || validator.isEmpty(token)) throw new HttpError(400, 'Token invalid!');
	} else {
		if (!code || validator.isEmpty(code)) throw new HttpError(400, 'Code invalid!');
	}

	// verify
	switch (mfaMethod) {
		case MfaMethod.Authenticator:
			const secretBase32 = generateSecretBase32ByUser(user);

			const verified = speakeasy.totp.verify({
				secret: secretBase32,
				encoding: 'base32',
				token: code,
				window: 1,
			});

			if (!verified) return ApiResponse.error(res, 400, 'Verify fail!');
			break;

		case MfaMethod.Email:
			const tokenHash = hashToken(token);

			const isTokenValid = !(await redisClient.get(`blacklist:mfa_token:email:${tokenHash}`));
			if (!isTokenValid) throw new HttpError(400, 'Verify fail!');

			const decoded = verifyToken(token, () => {
				throw new HttpError(400, 'Verify fail!');
			});

			if (decoded.userId !== req.tokenDecoded.userId) throw new HttpError(400, 'Verify fail!');
			if (decoded.mfaMethod !== MfaMethod.Email) throw new HttpError(400, 'Verify fail!');

			await redisClient.setEx(`blacklist:mfa_token:email:${tokenHash}`, getTokenRemainingTime(token), '1');

			break;

		case MfaMethod.Sms:
			const otpHash = hashToken(`${user.id}-${code}`);

			const isOtpValid = !!(await redisClient.get(`otp:sms:${otpHash}`));
			if (!isOtpValid) throw new HttpError(400, 'Verify fail!');

			await redisClient.del(`otp:sms:${otpHash}`);

			break;
	}

	const { refreshToken, accessToken } = await generateTokenAndSession(req, user);
	await redisClient.setEx(
		`blacklist:mfa_token:${hashToken(req.tokenDecoded.token)}`,
		getTokenRemainingTime(req.tokenDecoded.token),
		'1',
	);
	return ApiResponse.success(res, 200, 'Login Success.', { refreshToken, accessToken });
});

module.exports = {
	register,
	login,
	logout,
	refreshAccessToken,
	forgotPassword,
	resetPassword,
	mfaSmsSend,
	mfaEmailSend,
	mfaVerify,
};
