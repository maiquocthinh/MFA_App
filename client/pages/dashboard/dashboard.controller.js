app.controller('DashboardController', function ($scope, AccountService) {
	$scope.activeTab = 'profile';

	$scope.setActiveTab = function (tab) {
		$scope.activeTab = tab;
	};

	(function init() {
		loadProfile();
		loadSessions();
	})();

	function loadProfile() {
		AccountService.me()
			.then((result) => {
				$scope.user = result.data;
				$scope.profileForm = result.data;

				$scope.mfaMethods = [
					{ id: 'sms', name: 'SMS', enabled: $scope.profileForm.mfaMethods.includes('sms') },
					{ id: 'email', name: 'Email', enabled: $scope.profileForm.mfaMethods.includes('email') },
					{
						id: 'authenticator',
						name: 'Authenticator App',
						enabled: $scope.profileForm.mfaMethods.includes('authenticator'),
					},
				];
			})
			.catch((error) => {
				notyf.error(error.message);
			});
	}

	function loadSessions() {
		AccountService.sessions()
			.then((result) => {
				const sessions = result.data;
				$scope.sessions = sessions.sort((a, b) => b.isCurrentSession - a.isCurrentSession);
			})
			.catch((error) => {
				notyf.error(error.message);
			});
	}

	$scope.saveProfile = function () {
		AccountService.update({ phoneNumber: $scope.profileForm.phoneNumber })
			.then(function (response) {
				notyf.success('Cập nhật Profile thành công');
			})
			.catch(function (error) {
				notyf.error(error.message);
			});
	};

	$scope.changePassword = function () {
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

		AccountService.update({ password: $scope.newPassword })
			.then(function (response) {
				notyf.success('Cập nhật Mật khẩu thành công');
			})
			.catch(function (error) {
				notyf.error(error.message);
			});
	};

	$scope.revokeSession = function (sessionId) {
		AccountService.revokeSession(sessionId)
			.then(function (result) {
				notyf.success(result.message);
				const session = $scope.sessions.find((session) => session.id === sessionId);
				session.isActive = false;
			})
			.catch(function (error) {
				notyf.error(error.message);
			});
	};

	$scope.updateMfaMethod = function (method) {
		if (method.enabled) {
			// Call the API to enable the MFA method
			AccountService.enableMfaMethod(method.id).then(
				function (result) {
					notyf.success(`${method.name} enabled successfully!`);
				},
				function (error) {
					notyf.error(`Failed to enable ${method.name}!`);
					method.enabled = false; // Revert the checkbox
				},
			);
		} else {
			// Call the API to disable the MFA method
			AccountService.disableMfaMethod(method.id).then(
				function (result) {
					notyf.success(`${method.name} disabled successfully!`);
				},
				function (error) {
					notyf.error(`Failed to disable ${method.name}!`);
					method.enabled = true; // Revert the checkbox
				},
			);
		}
	};

	$scope.getAuthenticatorQRCode = function () {
		AccountService.getAuthenticatorQRCode()
			.then(function (result) {
				$scope.qrCodeUrl = result.data.qrCodeUrl;
			})
			.catch(function (error) {
				notyf.error(error.message);
			});
	};
});
