const twilio = require("twilio");
const env = require("./env");

const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

module.exports = client
