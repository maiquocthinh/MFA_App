const crypto = require('crypto');
var base32 = require('hi-base32');

const generateSecretBase32ByUser = (user) => {
	const secretInput = `${user.id}-${user.createdAt.toISOString()}`;
	const secret = crypto.createHash('md5').update(secretInput).digest('hex');
	const secretBase32 = base32.encode(secret);
	return secretBase32;
};

module.exports = { generateSecretBase32ByUser };
