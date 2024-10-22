app.controller('LoginController', function ($scope, $location, AuthService) {
	$scope.loginForm = {};
	$scope.errorMessage = '';

	$scope.login = function ($event) {
		$event.preventDefault();

		$scope.errorMessages = {
			email: '',
			password: '',
		};

		let hasError = false;

		// Validate các field

		if (!$scope.loginForm.email) {
			$scope.errorMessages.email = 'Vui lòng nhập email.';
			hasError = true;
		} else if (!validateEmail($scope.loginForm.email)) {
			$scope.errorMessages.email = 'Email không hợp lệ.';
			hasError = true;
		}

		if (!$scope.loginForm.password) {
			$scope.errorMessages.password = 'Vui lòng nhập mật khẩu.';
			hasError = true;
		}

		if (hasError) {
			return;
		}

		AuthService.login($scope.loginForm)
			.then(function (result) {
				if (result.data.mfaRequired) {
					$location.path('/mfa');
				} else {
					notyf.success(result.message);
					$location.path('/dashboard');
				}
			})
			.catch(function (error) {
				notyf.error(error.message);
			});
	};

	function validateEmail(email) {
		var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return re.test(String(email).toLowerCase());
	}
});
