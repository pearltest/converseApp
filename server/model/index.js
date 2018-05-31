// Database
const db = require('./_db');

// Models
const User = require('./user');
const Message = require('./message');
const Chatroom = require('./chatroom');
const Chatrequest = require('./chatrequest');
const Chatlog = require('./chatlog');
const Userroom = require('./userroom');

// Associations

User.hasMany(Chatrequest, { as:'sender' , foreignKey: 'TCHAT_REQUEST_Sender'});
Chatrequest.belongsTo(User, { as:'sender', foreignKey: 'TCHAT_REQUEST_Sender'});
User.hasMany(Chatrequest, {  as:'receiver' , foreignKey: 'TCHAT_REQUEST_Receiver'});
Chatrequest.belongsTo(User, {  as:'receiver' , foreignKey: 'TCHAT_REQUEST_Receiver'});

User.hasMany(Chatlog, { as:'senderUser' , foreignKey: 'TChat_Log_Sender'});
Chatlog.belongsTo(User, { as:'senderUser' , foreignKey: 'TChat_Log_Sender'});
User.hasMany(Chatlog, { as:'receiverUser' , foreignKey: 'TChat_Log_Receiver'});
Chatlog.belongsTo(User, { as:'receiverUser' , foreignKey: 'TChat_Log_Receiver'});

Chatrequest.hasMany(Chatlog, { as:'chatRequestData' , foreignKey: 'TChat_Log_Chat_Request_ID'});
Chatlog.belongsTo(Chatrequest, { as:'chatRequestData' , foreignKey: 'TChat_Log_Chat_Request_ID'});

Chatroom.hasMany(Chatlog, { as:'chatRoomLogs' , foreignKey: 'TChat_Log_Chat_Room_ID'});
Chatlog.belongsTo(Chatroom, { as:'chatRoomLogs' , foreignKey: 'TChat_Log_Chat_Room_ID'});

User.hasMany(Userroom, { as:'userRoomData' , foreignKey: 'DUSER_ROOM_UID'});
Userroom.belongsTo(User, { as:'userRoomData', foreignKey: 'DUSER_ROOM_UID'});
Chatroom.hasMany(Userroom, { as:'chatRoomData' , foreignKey: 'DUSER_ROOM_Chat_Room_ID'});
Userroom.belongsTo(Chatroom, { as:'chatRoomData', foreignKey: 'DUSER_ROOM_Chat_Room_ID'});


User.hasMany(Message, { as:'userDetail' , foreignKey: 'TMESSAGES_UID'});
Message.belongsTo(User, { as:'userDetail' , foreignKey: 'TMESSAGES_UID'});

Chatroom.hasMany(Message, { as:'userRoomMessage' , foreignKey: 'TMESSAGES_Chat_Room_ID'});
Message.belongsTo(Chatroom, { as:'userRoomMessage' , foreignKey: 'TMESSAGES_Chat_Room_ID'});

module.exports = db;
