app.controller('MfaAuthenticatorController', function ($scope, $location, AuthService) {
	$scope.mfaVerify = function () {
		if (!$scope.authenticatorCode) return ($scope.errorMessage = 'Vui lòng nhập code');

		AuthService.mfaVerify({ method: 'authenticator', code: $scope.authenticatorCode })
			.then(function (result) {
				notyf.success(result.message);
				$location.path('/dashboard');
			})
			.catch(function (error) {
				notyf.error(error.message);
			});
	};
});
