const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const Session = require('./session.model');

const User = sequelize.define(
	'User',
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			field: 'id',
			primaryKey: true,
		},
		email: {
			type: DataTypes.STRING,
			field: 'email',
			allowNull: false,
			unique: true,
		},
		passwordHash: {
			type: DataTypes.STRING,
			field: 'password_hash',
			allowNull: false,
		},
		phoneNumber: {
			type: DataTypes.STRING,
			field: 'phone_number',
		},
		mfaMethods: {
			type: DataTypes.JSON,
			field: 'mfa_methods',
			defaultValue: [],
		},
		createdAt: {
			type: DataTypes.DATE,
			field: 'created_at',
			defaultValue: DataTypes.NOW,
		},
		updatedAt: {
			type: DataTypes.DATE,
			field: 'updated_at',
			defaultValue: DataTypes.NOW,
			onUpdate: DataTypes.NOW,
		},
	},
	{
		tableName: 'users',
		timestamps: false,
	},
);

User.hasMany(Session, { foreignKey: 'userId', as: 'sessions' });
Session.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = User;
