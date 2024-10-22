const asyncHandler = require('express-async-handler');
const { verifyToken } = require('../utils/jwt');
const HttpError = require('../utils/httpError');

const authenticateToken = asyncHandler(async (req, res, next) => {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith('Bearer ')) throw new HttpError(401, 'Unauthenticated');

	const token = authHeader.split(' ')[1];

	const decoded = verifyToken(token, () => {
		throw new HttpError(401, 'Unauthenticated');
	});

	req.tokenDecoded = { ...decoded, token };
	next();
});

module.exports = authenticateToken;
