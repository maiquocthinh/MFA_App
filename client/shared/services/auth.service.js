app.service('AuthService', function ($http, $window) {
	this.login = function (loginForm) {
		return $http
			.post('/api/auth/login', loginForm)
			.then(function (response) {
				if (response.data.data.mfaRequired) {
					$window.localStorage.setItem('mfaMethods', JSON.stringify(response.data.data.mfaMethods));
					$window.localStorage.setItem('mfaToken', response.data.data.mfaToken);

					return response.data;
				} else {
					if (response.data.data.accessToken && response.data.data.refreshToken) {
						$window.localStorage.setItem('accessToken', response.data.data.accessToken);
						$window.localStorage.setItem('refreshToken', response.data.data.refreshToken);

						return response.data;
					}
				}
				throw new Error(response.data.message);
			})
			.catch(function (error) {
				if (error.xhrStatus) throw new Error(error.data.message);
				throw new Error(error.message);
			});
	};

	this.register = function (registerForm) {
		return $http
			.post('/api/auth/register', registerForm)
			.then(function (response) {
				return response.data;
			})
			.catch(function (response) {
				throw new Error(response.data.message);
			});
	};

	this.isLoggedIn = function () {
		const token = $window.localStorage.getItem('refreshToken');
		return !!token;
	};

	this.logout = function () {
		return $http
			.post('/api/auth/logout', {
				refreshToken: $window.localStorage.getItem('refreshToken'),
			})
			.then(function (response) {
				$window.localStorage.removeItem('accessToken');
				$window.localStorage.removeItem('refreshToken');
				return response.data;
			})
			.catch(function (error) {
				if (error.xhrStatus) throw new Error(error.data.message);
				throw new Error(error.message);
			});
	};

	this.isMfaAccess = function () {
		return !!$window.localStorage.getItem('mfaMethods') && !!$window.localStorage.getItem('mfaToken');
	};

	this.mfaSendSms = function () {
		const mfaToken = $window.localStorage.getItem('mfaToken');

		return $http({
			method: 'POST',
			url: '/api/auth/mfa/sms/send',
			headers: { Authorization: 'Bearer ' + mfaToken },
		}).catch(function (error) {
			if (error.xhrStatus) throw new Error(error.data.message);
			throw new Error(error.message);
		});
	};

	this.mfaSendEmail = function () {
		const mfaToken = $window.localStorage.getItem('mfaToken');

		return $http({
			method: 'POST',
			url: '/api/auth/mfa/email/send',
			headers: { Authorization: 'Bearer ' + mfaToken },
		}).catch(function (error) {
			if (error.xhrStatus) throw new Error(error.data.message);
			throw new Error(error.message);
		});
	};

	this.mfaVerify = function ({ method, code, token }) {
		const body = { mfaMethod: method };
		const mfaToken = $window.localStorage.getItem('mfaToken');

		switch (method) {
			case 'sms':
				body.code = code;
				break;
			case 'email':
				body.token = token;
				break;
			case 'authenticator':
				body.code = code;
				break;
			default:
				throw Error('Wrong mfa method');
		}

		return $http({
			method: 'POST',
			url: '/api/auth/mfa/verify',
			headers: { Authorization: 'Bearer ' + mfaToken },
			data: body,
		})
			.then(function (response) {
				if (response.data.data.accessToken && response.data.data.refreshToken) {
					$window.localStorage.setItem('accessToken', response.data.data.accessToken);
					$window.localStorage.setItem('refreshToken', response.data.data.refreshToken);
					$window.localStorage.removeItem('mfaMethods');
					$window.localStorage.removeItem('mfaToken');

					return response.data;
				}
				throw new Error(response.data.message);
			})
			.catch(function (error) {
				if (error.xhrStatus) throw new Error(error.data.message);
				throw new Error(error.message);
			});
	};

	this.refreshAccessToken = function () {
		const refreshToken = $window.localStorage.getItem('refreshToken');

		return $http.post('/api/auth/refresh-token', { refreshToken: refreshToken }).then(function (response) {
			accessToken = response.data.data.accessToken;
			$window.localStorage.setItem('accessToken', accessToken);
			return accessToken;
		});
	};

	this.forgotPassword = function (email) {
		return $http
			.post('/api/auth/forgot-password', { email })
			.then(function (response) {
				return response.data;
			})
			.catch(function (error) {
				if (error.xhrStatus) throw new Error(error.data.message);
				throw new Error(error.message);
			});
	};

	this.resetPassword = function ({ token, newPassword }) {
		return $http
			.post('/api/auth/reset-password', { token, newPassword })
			.then(function (response) {
				return response.data;
			})
			.catch(function (error) {
				if (error.xhrStatus) throw new Error(error.data.message);
				throw new Error(error.message);
			});
	};
});
