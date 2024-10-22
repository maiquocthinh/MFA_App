app.controller('ResetPasswordController', function ($scope, $location, AuthService) {
	const queryParams = $location.search();
	const token = queryParams.token;

	$scope.resetPassword = function () {
		$scope.errorMessages = {
			newPassword: '',
			confirmPassword: '',
		};
		let hasError = false;

		if (!$scope.newPassword) {
			$scope.errorMessages.newPassword = 'Vui lòng nhập mật khẩu.';
			hasError = true;
		} else if ($scope.newPassword.length < 6) {
			$scope.errorMessages.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự.';
			hasError = true;
		}
		if ($scope.newPassword !== $scope.confirmPassword) {
			$scope.errorMessages.confirmPassword = 'Mật khẩu nhập lại không trùng!';
			hasError = true;
		}

		if (hasError) return;

		AuthService.resetPassword({ token: token, newPassword: $scope.newPassword })
			.then((result) => {
				notyf.success('Reset password successed.');
			})
			.catch((error) => {
				notyf.error(error.message);
			});
	};
});
