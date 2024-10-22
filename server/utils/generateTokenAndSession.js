const Session = require('../models/session.model');
const { generateToken, hashToken, getTokenRemainingTime } = require('../utils/jwt');

const generateTokenAndSession = async (req, user) => {
	const refreshToken = generateToken({ userId: user.id }, 2592000); // 30 days
	const refreshTokenHash = hashToken(refreshToken);
	const accessToken = generateToken({ userId: user.id, refreshTokenHash }, 300); // 5 minutes

	// insert new sesssion
	const now = new Date();
	await Session.create({
		userId: user.id,
		refreshTokenHash: refreshTokenHash,
		ipAddress: req.ip,
		device: `${req.useragent?.browser} on ${req.useragent?.os}`,
		expiredAt: new Date(now.getTime() + getTokenRemainingTime(refreshToken) * 1000),
	});

	return { accessToken, refreshToken };
};
module.exports = generateTokenAndSession;
