require('dotenv').config();
const { cleanEnv, str, port, email, url } = require('envalid');

const env = cleanEnv(process.env, {
	APP_PORT: port(),
	APP_PUBLIC_URL: url(),
	DB_NAME: str(),
	DB_USER: str(),
	DB_PASSWORD: str(),
	DB_HOST: str(),
	DB_PORT: port(),
	DB_DIALECT: str({ choices: ['mysql', 'postgres', 'sqlite', 'mssql'] }),
	EMAIL_NAME: email(),
	EMAIL_PASSWORD: str(),
	JWT_SECRET_KEY: str(),
	JWT_RESET_PASSWORD_EXPRY_TIME: str(),
	JWT_CONFIRM_LOGIN_EXPRY_TIME: str(),
	TWILIO_ACCOUNT_SID: str(),
	TWILIO_AUTH_TOKEN: str(),
	TWILIO_SMS_NUMBER: str(),
	TWILIO_OTP_EXPRY_TIME: str(),
});

module.exports = env;
