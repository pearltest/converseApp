const { Sequelize, INTEGER, STRING, VIRTUAL, DATE, BOOLEAN, UUID } = require('sequelize');
const bcrypt = require('bcryptjs');
const db = require('./_db');
const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

const Chatlog = db.define('CON_T_Chat_Log', {
    TChat_Log_Chat_Log_ID: {
        allowNull: false,
        autoIncrement: true,
        type: UUID,
        primaryKey: true
    },
    TChat_Log_Chat_Request_ID: {
        allowNull: true,
        type: INTEGER,
        references: {
            model: "CON_T_Chat_Request",
            key: "TCHAT_REQUEST_Chat_Request_ID"
        }
    },
    TChat_Log_Sender: {
        allowNull: true,
        type: INTEGER,
        references: {
            model: "CON_T_Users",
            key: "TUser_UID"
        }
    },
    TChat_Log_Receiver: {
        type: INTEGER,
        references: {
            model: "CON_T_Users",
            key: "TUser_UID"
        },
        allowNull: true,
    },
    TChat_Log_Status: {
        type: STRING,
        allowNull: true,
    },
    TChat_Log_Created_On: {
        type: Date,
        defaultValue: currentTime
    },
    TChat_Log_Updated_On: {
        type: Date,
        defaultValue:currentTime
    },
    TChat_Log_IS_Delete: {
        type: Boolean,
        defaultValue: false
    },
    TChat_Log_Chat_Room_ID: {
        allowNull: true,
        type: INTEGER,
        references: {
            model: "CON_H_Chat_Room",
            key: "HCHAT_ROOM_Chat_Room_ID"
        }
    },

}, {
  timestamps: false,
  underscore: true
});

module.exports = Chatlog;
