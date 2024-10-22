const path = require('path');
const apiRoutes = require('./api.route')

const routes = (app) => {
	// BE routes
	app.use("/api", apiRoutes)

	// FE routes
	app.use('/*', (req, res) => {
		res.sendFile(path.join(__dirname, '../..', 'client/app.html'));
	});
};

module.exports = routes;
