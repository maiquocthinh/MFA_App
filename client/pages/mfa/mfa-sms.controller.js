app.controller('MfaSmsController', function ($scope, $location, AuthService) {
	$scope.mfaVerify = function () {
		if (!$scope.smsCode) return ($scope.errorMessage = 'Vui lòng nhập code');

		AuthService.mfaVerify({ method: 'sms', code: $scope.smsCode })
			.then(function (result) {
				notyf.success(result.message);
				$location.path('/dashboard');
			})
			.catch(function (error) {
				notyf.error(error.message);
			});
	};
});
