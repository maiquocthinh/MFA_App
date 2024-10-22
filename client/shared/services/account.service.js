app.service('AccountService', function ($http, $window) {
	this.me = function () {
		const accessToken = $window.localStorage.getItem('accessToken');

		return $http({
			method: 'GET',
			url: '/api/account/me',
			headers: { Authorization: 'Bearer ' + accessToken },
		})
			.then(function (response) {
				return response.data;
			})
			.catch(function (error) {
				if (error.xhrStatus) throw new Error(error.data.message);
				throw new Error(error.message);
			});
	};

	this.update = function (body) {
		const accessToken = $window.localStorage.getItem('accessToken');

		return $http({
			method: 'PATCH',
			url: '/api/account/update',
			headers: { Authorization: 'Bearer ' + accessToken },
			data: body,
		})
			.then(function (response) {
				return response.data;
			})
			.catch(function (error) {
				if (error.xhrStatus) throw new Error(error.data.message);
				throw new Error(error.message);
			});
	};

	this.sessions = function () {
		const accessToken = $window.localStorage.getItem('accessToken');

		return $http({
			method: 'GET',
			url: '/api/account/sessions',
			headers: { Authorization: 'Bearer ' + accessToken },
		})
			.then(function (response) {
				return response.data;
			})
			.catch(function (error) {
				if (error.xhrStatus) throw new Error(error.data.message);
				throw new Error(error.message);
			});
	};

	this.revokeSession = function (sessionId) {
		const accessToken = $window.localStorage.getItem('accessToken');

		return $http({
			method: 'DELETE',
			url: `/api/account/sessions/${sessionId}`,
			headers: { Authorization: 'Bearer ' + accessToken },
		})
			.then(function (response) {
				return response.data;
			})
			.catch(function (error) {
				if (error.xhrStatus) throw new Error(error.data.message);
				throw new Error(error.message);
			});
	};

	this.enableMfaMethod = function (method) {
		const accessToken = $window.localStorage.getItem('accessToken');

		return $http({
			method: 'POST',
			url: '/api/account/mfa/enable',
			headers: { Authorization: 'Bearer ' + accessToken },
			data: { mfaMethod: method },
		})
			.then(function (response) {
				return response.data;
			})
			.catch(function (error) {
				if (error.xhrStatus) throw new Error(error.data.message);
				throw new Error(error.message);
			});
	};

	this.disableMfaMethod = function (method) {
		const accessToken = $window.localStorage.getItem('accessToken');

		return $http({
			method: 'POST',
			url: '/api/account/mfa/disable',
			headers: { Authorization: 'Bearer ' + accessToken },
			data: { mfaMethod: method },
		})
			.then(function (response) {
				return response.data;
			})
			.catch(function (error) {
				if (error.xhrStatus) throw new Error(error.data.message);
				throw new Error(error.message);
			});
	};

	this.getAuthenticatorQRCode = function () {
		const accessToken = $window.localStorage.getItem('accessToken');

		return $http({
			method: 'GET',
			url: '/api/account/mfa/authenticator/setup',
			headers: { Authorization: 'Bearer ' + accessToken },
		})
			.then(function (response) {
				return response.data;
			})
			.catch(function (error) {
				if (error.xhrStatus) throw new Error(error.data.message);
				throw new Error(error.message);
			});
	};
});
