const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Session = sequelize.define(
	'Session',
	{
		id: {
			type: DataTypes.INTEGER,
			field: 'id',
			autoIncrement: true,
			primaryKey: true,
		},
		userId: {
			type: DataTypes.INTEGER,
			field: 'user_id',
			allowNull: false,
			references: {
				model: 'users',
				key: 'id',
			},
		},
		refreshTokenHash: {
			type: DataTypes.STRING,
			field: 'refresh_token_hash',
		},
		device: {
			type: DataTypes.STRING,
			field: 'device',
		},
		ipAddress: {
			type: DataTypes.STRING,
			field: 'ip_address',
		},
		lastActive: {
			type: DataTypes.DATE,
			field: 'last_active',
			defaultValue: DataTypes.NOW,
		},
		createdAt: {
			type: DataTypes.DATE,
			field: 'created_at',
			defaultValue: DataTypes.NOW,
		},
		expiredAt: {
			type: DataTypes.DATE,
			field: 'expired_at',
			allowNull: false,
		},
		isActive: {
			type: DataTypes.BOOLEAN,
			field: 'is_active',
			defaultValue: true,
		},
	},
	{
		tableName: 'sessions',
		timestamps: false,
	},
);

module.exports = Session;
