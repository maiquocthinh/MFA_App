app.controller('ForgotPasswordController', function ($scope, AuthService) {
	$scope.email = '';

	$scope.forgotPassword = function () {
		$scope.errorMessages = {
			email: '',
		};

		let hasError = false;

		if (!$scope.email) {
			$scope.errorMessages.email = 'Vui lòng nhập email.';
			hasError = true;
		} else if (!validateEmail($scope.email)) {
			$scope.errorMessages.email = 'Email không hợp lệ.';
			hasError = true;
		}

		if (hasError) return;

		AuthService.forgotPassword($scope.email)
			.then((result) => {
				notyf.success('Check your email to reset password');
			})
			.catch((error) => {
				notyf.error(error.message);
			});
	};

	function validateEmail(email) {
		var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return re.test(String(email).toLowerCase());
	}
});
