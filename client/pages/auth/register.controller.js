app.controller('RegisterController', function ($scope, AuthService) {
	$scope.pageTitle = 'Register Page';
	$scope.registerForm = {};

	$scope.register = function ($event) {
		$event.preventDefault();

		$scope.errorMessages = {
			phoneNumber: '',
			email: '',
			password: '',
			confirmPassword: '',
		};

		let hasError = false;

		// Validate các field

		if (!$scope.registerForm.email) {
			$scope.errorMessages.email = 'Vui lòng nhập email.';
			hasError = true;
		} else if (!validateEmail($scope.registerForm.email)) {
			$scope.errorMessages.email = 'Email không hợp lệ.';
			hasError = true;
		}

		if (!$scope.registerForm.phoneNumber) {
			$scope.errorMessages.phoneNumber = 'Vui lòng nhập số điện thoại.';
			hasError = true;
		}

		if (!$scope.registerForm.password) {
			$scope.errorMessages.password = 'Vui lòng nhập mật khẩu.';
			hasError = true;
		} else if ($scope.registerForm.password.length < 6) {
			$scope.errorMessages.password = 'Mật khẩu phải có ít nhất 6 ký tự.';
			hasError = true;
		}

		if ($scope.registerForm.password !== $scope.registerForm.confirmPassword) {
			$scope.errorMessages.confirmPassword = 'Mật khẩu xác nhận không khớp.';
			hasError = true;
		}

		// Nếu có lỗi, dừng lại
		if (hasError) {
			return;
		}

		AuthService.register($scope.registerForm)
			.then(function (result) {
				notyf.success(result.message);
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
