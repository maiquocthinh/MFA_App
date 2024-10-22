class ApiResponse {
	static success(res, statusCode = 200, message = 'Request successful', data = undefined) {
		return res.status(statusCode).json({
			success: true,
			message: message,
			data: data,
		});
	}

	static error(res, statusCode = 500, message = 'Error occurred') {
		return res.status(statusCode).json({
			success: false,
			message: message,
		});
	}
}

module.exports = ApiResponse