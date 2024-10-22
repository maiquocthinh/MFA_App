app.controller('HeaderController', function ($scope, $location, AuthService) {
	$scope.isLoggedIn = function () {
		return AuthService.isLoggedIn();
	};

	$scope.logout = function () {
		AuthService.logout()
			.then(function (result) {
				notyf.success(result.message);
				$location.path('/login');
			})
			.catch(function (error) {
				notyf.success(error.message);
			});
	};
});
