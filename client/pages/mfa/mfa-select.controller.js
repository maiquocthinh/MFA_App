app.controller('MfaSelectController', function ($scope, $location, $window, AuthService) {
	$scope.availableMfaMethods = JSON.parse($window.localStorage.getItem('mfaMethods'));

	$scope.selectMfaMethod = function (method) {
		switch (method) {
			case 'sms':
				AuthService.mfaSendSms()
					.then(function () {
						notyf.success('Check your phone to get OTP');
						$location.path('/mfa/sms');
					})
					.catch(function (error) {
						if (error.xhrStatus) notyf.success(error.data.message);
						notyf.success(error.message);
					});
				break;
			case 'email':
				AuthService.mfaSendEmail()
					.then(function () {
						notyf.success('Check your email to get OTP');
					})
					.catch(function (error) {
						if (error.xhrStatus) notyf.success(error.data.message);
						notyf.success(error.message);
					});
				break;
			case 'authenticator':
				$location.path('/mfa/authenticator');
				break;
			default:
				$location.path('/mfa');
		}
	};
});
