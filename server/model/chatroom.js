const { Sequelize, INTEGER, STRING, VIRTUAL, DATE, BOOLEAN, UUID } = require('sequelize');
const db = require('./_db');
const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

const Chatroom = db.define('CON_H_Chat_Room', {
  HCHAT_ROOM_Chat_Room_ID: {
    allowNull: false,
    autoIncrement: true,
    type: UUID,
    primaryKey: true
  },
  HCHAT_ROOM_Name: STRING,
  HCHAT_ROOM_IS_Group: {
      type: Boolean,
      defaultValue: false
  },
  HCHAT_ROOM_IS_Delete: {
      type: Boolean,
      defaultValue: false
  },
  }, {
  timestamps: false,
  underscore: true
});


module.exports = Chatroom;
