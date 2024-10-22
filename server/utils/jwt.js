const { createHash } = require('node:crypto');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const HttpError = require('./httpError');

const generateToken = (payload, expiresIn) => {
	const token = jwt.sign(payload, env.JWT_SECRET_KEY, { expiresIn });
	return token;
};

const verifyToken = (token, onError = null) => {
	try {
		const decoded = jwt.verify(token, env.JWT_SECRET_KEY);
		return decoded;
	} catch (error) {
		if (onError) return onError();
		throw new HttpError(400, 'Token invalid!');
	}
};

const hashToken = (token) => {
	return createHash('sha256').update(token).digest('hex');
};

const getTokenRemainingTime = (token) => {
	const decoded = jwt.verify(token, env.JWT_SECRET_KEY);

	if (!decoded || !decoded.exp) return 0;

	const now = Math.floor(Date.now() / 1000);
    const remainingTime = decoded.exp - now;

	return remainingTime > 0 ? remainingTime : 0
};

module.exports = { generateToken, verifyToken, hashToken, getTokenRemainingTime };
