app.factory('AuthInterceptor', function ($q, $injector) {
	return {
		responseError: function (rejection) {
			if (rejection.status === 401) {
			var $http = $injector.get('$http');
			var AuthService = $injector.get('AuthService');

				return AuthService.refreshAccessToken()
					.then(function (newAccessToken) {
						// Cập nhật Authorization header với accessToken mới
						rejection.config.headers['Authorization'] = 'Bearer ' + newAccessToken;
						// Thực hiện lại request ban đầu với cấu hình gốc
						return $http(rejection.config);
					})
					.catch(function () {
						// Xử lý lỗi khi làm mới token thất bại
						return $q.reject(rejection);
					});
			}
			return $q.reject(rejection);
		},
	};
});
