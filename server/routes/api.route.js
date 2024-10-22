const { Router } = require('express');
const router = Router();
const sequelize = require('../config/sequelize');
const authController = require('../controllers/auth.controller');
const accountController = require('../controllers/account.controller');
const authenticateToken = require('../middlewares/authenticateToken.middleware');
const trackingLastActive = require('../middlewares/trackingLastActive.middleware');

router.get('/health', async (req, res) => {
	try {
		await sequelize.authenticate();

		return res.status(200).json({
			error: false,
			message: 'Good!',
		});
	} catch (error) {
		return res.status(500).json({
			error: true,
			message: 'Bad!',
			error: error.message,
		});
	}
});

router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/logout', authController.logout);
router.post('/auth/refresh-token', authController.refreshAccessToken);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/reset-password', authController.resetPassword);
router.post('/auth/mfa/sms/send', authenticateToken, authController.mfaSmsSend);
router.post('/auth/mfa/email/send', authenticateToken, authController.mfaEmailSend);
router.post('/auth/mfa/verify', authenticateToken, authController.mfaVerify);

router.get('/account/me', authenticateToken, trackingLastActive, accountController.me);
router.patch('/account/update', authenticateToken, accountController.update);
router.get('/account/sessions', authenticateToken, accountController.listSessions);
router.delete('/account/sessions/:sessionId', authenticateToken, accountController.revokeSession);
router.post('/account/mfa/enable', authenticateToken, accountController.mfaEnabled);
router.post('/account/mfa/disable', authenticateToken, accountController.mfaDisabled);
router.get('/account/mfa/authenticator/setup', authenticateToken, accountController.mfaAuthenticatorSetup);

module.exports = router;
