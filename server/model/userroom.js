const { Sequelize, INTEGER, STRING, VIRTUAL, DATE, BOOLEAN, UUID } = require('sequelize');
const db = require('./_db');
const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

const Userroom = db.define('CON_D_User_Rooms', {
    DUSER_ROOM_User_Room_ID: {
        allowNull: false,
        autoIncrement: true,
        type: UUID,
        primaryKey: true
    },
    DUSER_ROOM_UID: {
        type: INTEGER,
        references: {
            model: "CON_T_Users",
            key: "TUser_UID"
        }
    },
    DUSER_ROOM_Chat_Room_ID: {
        type: INTEGER,
        references: {
            model: "CON_H_Chat_Room",
            key: "HCHAT_ROOM_Chat_Room_ID"
        }
    },
    DUSER_ROOM_Role: STRING, //Admin/User
//   HCHAT_ROOM_IS_Delete: {
//       type: Boolean,
//       defaultValue: false
//   },
  }, {
  timestamps: false,
  underscore: true
});


module.exports = Userroom;
