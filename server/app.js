const express = require('express');
const path = require('path');
const useragent = require('express-useragent');
const app = express();

const env = require('./config/env');
const sequelize = require('./config/sequelize');
const redisClient = require('./config/redis');
const routes = require('./routes');
const ApiResponse = require('./utils/apiResponse');
const HttpError = require('./utils/httpError');

// Set Static
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../client')));

// Template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.enable('trust proxy');
app.use(express.json());
app.use(useragent.express());

// Mount Routes
routes(app);

// Error 404 handler middleware
app.use((req, res, next) => {
	next(new HttpError(404, 'Not found'));
});

// Error handler middleware
app.use((error, req, res, next) => {
	return ApiResponse.error(res, error.statusCode || 500, error.message || 'Internal Server Error');
});

module.exports = {
	run: async () => {
		try {
			// Connect DB
			await sequelize.sync(/* { alter: true } */).then(() => {
				console.log('Connect DB Successed!');
			});

			// Connect Redis
			await redisClient.connect();

			// Start Server
			app.listen(env.APP_PORT, () => {
				console.log(`Server is running at port ${env.APP_PORT}`);
			});
		} catch (error) {
			console.error('An error occurred during startup:', error);
		}
	},
};
