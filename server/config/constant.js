const EmailType = Object.freeze({
	RESET_PASSWORD: 'reset-password',
	CONFIRM_LOGIN: 'cofirm-login',
});

const MfaMethod = Object.freeze({
	Email: 'email',
	Sms: 'sms',
	Authenticator: 'authenticator',
});

module.exports = { EmailType, MfaMethod };
