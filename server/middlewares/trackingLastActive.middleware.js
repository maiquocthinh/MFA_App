const asyncHandler = require('express-async-handler');
const Session = require('../models/session.model');

const trackingLastActive = asyncHandler(async (req, res, next) => {
	// Update last active time of session
	await Session.update({ lastActive: new Date() }, { where: { refreshTokenHash: req.tokenDecoded.refreshTokenHash } });
	next();
});

module.exports = trackingLastActive;
