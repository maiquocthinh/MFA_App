var app = angular.module('myApp', ['ngRoute']);

app.config(function ($routeProvider, $httpProvider, $locationProvider) {
	$routeProvider
		.when('/login', {
			templateUrl: 'pages/auth/login.template.html',
			controller: 'LoginController',
			resolve: {
				auth: function (AuthService, $location) {
					if (AuthService.isLoggedIn()) {
						$location.path('/dashboard');
					}
				},
			},
		})
		.when('/register', {
			templateUrl: 'pages/auth/register.template.html',
			controller: 'RegisterController',
			resolve: {
				auth: function (AuthService, $location) {
					if (AuthService.isLoggedIn()) {
						$location.path('/dashboard');
					}
				},
			},
		})
		.when('/forgot-password', {
			templateUrl: 'pages/auth/forgot-password.template.html',
			controller: 'ForgotPasswordController',
			resolve: {
				auth: function (AuthService, $location) {
					if (AuthService.isLoggedIn()) {
						$location.path('/dashboard');
					}
				},
			},
		})
		.when('/reset-password', {
			templateUrl: 'pages/auth/reset-password.template.html',
			controller: 'ResetPasswordController',
			resolve: {
				auth: function (AuthService, $location) {
					if (AuthService.isLoggedIn()) {
						$location.path('/dashboard');
					}
				},
			},
		})
		.when('/dashboard', {
			templateUrl: 'pages/dashboard/dashboard.template.html',
			controller: 'DashboardController',
			resolve: {
				auth: function (AuthService, $location) {
					if (!AuthService.isLoggedIn()) {
						$location.path('/login');
					}
				},
			},
		})
		.when('/mfa', {
			templateUrl: 'pages/mfa//mfa-select.template.html',
			controller: 'MfaSelectController',
			resolve: {
				auth: function (AuthService, $location) {
					if (!AuthService.isMfaAccess()) {
						$location.path('/login');
					}
				},
			},
		})
		.when('/mfa/sms', {
			templateUrl: 'pages/mfa//mfa-sms.template.html',
			controller: 'MfaSmsController',
			resolve: {
				auth: function (AuthService, $location) {
					if (!AuthService.isMfaAccess()) {
						$location.path('/login');
					}
				},
			},
		})
		.when('/mfa/email', {
			templateUrl: 'pages/mfa//mfa-email.template.html',
			controller: 'MfaEmailController',
			resolve: {
				auth: function (AuthService, $location) {
					if (!AuthService.isMfaAccess()) {
						$location.path('/login');
					}
				},
			},
		})
		.when('/mfa/authenticator', {
			templateUrl: 'pages/mfa//mfa-authenticator.template.html',
			controller: 'MfaAuthenticatorController',
			resolve: {
				auth: function (AuthService, $location) {
					if (!AuthService.isMfaAccess()) {
						$location.path('/login');
					}
				},
			},
		})
		.otherwise({
			redirectTo: '/login',
		});

	// Kích hoạt HTML5 Mode
	$locationProvider.html5Mode(true);

	// Đăng ký interceptor
	$httpProvider.interceptors.push('AuthInterceptor');
});
