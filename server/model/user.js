const { Sequelize, INTEGER, STRING, VIRTUAL, DATE, BOOLEAN, UUID } = require('sequelize');
const db = require('./_db');
const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

const User = db.define('CON_T_Users', {

  TUser_UID: {
    allowNull: false,
		autoIncrement: true,
    type: UUID,
    primaryKey: true
  },
  TUSER_User_Name: {
    type: STRING,
    validate: {
      notEmpty: true,
    },
    unique: true,
  },
  TUSER_Device_Token: {
    type: STRING,
  },
  TUser_Image: STRING,
  TUser_Image_Url: STRING,
  TUser_Department: STRING,
  TUser_Emailid: STRING,
  TUser_Designation: STRING,
  TUser_Phonenumber: STRING,
  TUser_IS_Delete: {
      type: Boolean,
      defaultValue: false
  },
  T_USERS_Created_On: {
      type: Date,
      defaultValue: currentTime
  },
  T_USERS_Updated_On: {
      type: Date,
      defaultValue:currentTime
  },
}, {
  timestamps: false,
  underscore: true
});

module.exports = User;
