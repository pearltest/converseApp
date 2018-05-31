const router = require('express').Router();
const Chatroom = require('../../model/chatroom');
const Message = require('../../model/message');
const User = require('../../model/user');


router.get('/:chatroomId/messages', (req, res, next) => {
  let limit = 50;
  let offset = 0;
  Message.findAndCountAll()
  .then((data) => {
    let page = 1;
    let pages = Math.ceil(data.count / limit);
		offset = limit * (page - 1);
    Message.findAll({
      where: {
        TMESSAGES_Chat_Room_ID: req.params.chatroomId,
      },
      include: [
        { model: User, as: 'userDetail' },
        { model: Chatroom, as: 'userRoomMessage', attributes: ['HCHAT_ROOM_Chat_Room_ID', 'HCHAT_ROOM_Name'] },
      ],    
      attributes: ['TMESSAGES_Message_ID', 'TMESSAGES_Content', 'TMESSAGES_Created_On', 'TMESSAGES_UID'],
      limit: limit,
      offset: offset
    })
    .then((foundMessages) => {
      successHandler(foundMessages, res);
    });
  })
  .catch(next);
});


// GET request to get all chatrooms
router.get('/', (req, res, next) => {
  Chatroom.findAll()
  .then((foundChatrooms) => {
    successHandler(foundChatrooms, res);
  })
  .catch(next);
});


// POST request to add a message
router.post('/:chatroomId/messages', (req, res, next) => {
  User.findById(req.body.userId)
  .then((foundUser) => {
      return Message.create(req.body)
      .then((createdMessage) => {
        const createdMessageInJSON = createdMessage.toJSON();
        createdMessageInJSON.user = foundUser;
        return createdMessageInJSON;
      });
  })
  .then((completeMessage) => {
    successHandler(completeMessage, res);
  })
  .catch(next);
});

function failureHandler(data, res){
  res.setHeader("statusCode", 400);
  res.status(400).json({
    status: "Failed",
    statusCode: 400,
    data: data
  });
}

function successHandler(data, res){
  res.setHeader("statusCode", 200);
  res.status(200).json({
    status: "Success",
    statusCode: 200,
    data: data
  });
}

module.exports = router;
