app.controller('MfaEmailController', function ($scope, $location, AuthService) {
	const queryParams = $location.search();
	const token = queryParams.token;

	$scope.mfaVerify = function () {
		AuthService.mfaVerify({ method: 'email', token: token })
			.then(function (result) {
				notyf.success(result.message);
				$location.path('/dashboard').search({});;
			})
			.catch(function (error) {
				notyf.error(error.message);
			});
	};
});
