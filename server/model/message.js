const { Sequelize, INTEGER, STRING, VIRTUAL, DATE, BOOLEAN, UUID } = require('sequelize');
const db = require('./_db');
const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

const Message = db.define('CON_T_Messages', {
  TMESSAGES_Message_ID: {
    allowNull: false,
    autoIncrement: true,
    type: UUID,
    primaryKey: true
  },
  TMESSAGES_Content: STRING,
  TMESSAGES_UID: {
    type: INTEGER,
    references: {
      model: "CON_T_Users",
      key: "TUser_UID"
    }
  },
  TMESSAGES_Chat_Room_ID: {
    type: INTEGER,
    references: {
      model: "CON_H_Chat_Room",
      key: "HCHAT_ROOM_Chat_Room_ID"
    }
  },
  TMESSAGES_Status: STRING, 
  TMESSAGES_File_Type: STRING,
  TMESSAGES_Read_Status: STRING, //read/unread
  TMESSAGES__IS_Delete: {
      type: Boolean,
      defaultValue: false
  },
  TMESSAGES_Created_On: {
      type: Date,
      defaultValue: currentTime
  },
  TMESSAGES_Updated_On: {
      type: Date,
      defaultValue:currentTime
  },
  }, {
  timestamps: false,
  underscore: true
});

module.exports = Message;
