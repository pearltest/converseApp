const router = require('express').Router();
const passport = require('passport');
const moment = require('moment');
const Chatrequest = require('../../model/chatrequest');
const Chatlog = require('../../model/chatlog');
const User = require('../../model/user');
const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

// List my recent logs:
router.get('/:my_logs', (req, res, next) => {
  let limit = parseInt(req.query.limit);
  let offset = 0;
  Chatlog.findAndCountAll()
  .then((data) => {
    let page = parseInt(req.query.page);
    let pages = Math.ceil(data.count / limit);
		offset = limit * (page - 1);
    Chatlog.findAll({
      where: {
        TChat_Log_Receiver: req.query.userId,
        TChat_Log_Status: 'Request',
        TChat_Log_IS_Delete: false
      },
      include: [
        {model: Chatrequest, as: 'chatRequestData', attributes: ['TCHAT_REQUEST_Chat_Request_ID', 'TCHAT_REQUEST_IS_Delete']},
        {model: User, as:'senderUser', attributes: ['TUser_UID', 'TUSER_User_Name', 'TUser_Image']},
        {model: User, as:'receiverUser', attributes: ['TUser_UID', 'TUSER_User_Name', 'TUser_Image']}
      ],    
      attributes: ['TChat_Log_Chat_Log_ID', 'TChat_Log_Status', 'TChat_Log_Created_On', 'TChat_Log_Sender', 'TChat_Log_Receiver'],
      order: [
        ['TChat_Log_Created_On', 'ASC'], //ASC
      ],
      limit: limit,
      offset: offset
    })
    .then((users) => {
      res.setHeader("statusCode", 200);
      res.status(200).json({
        status: "Success",
        statusCode: 200,
        data: users.reverse(),
        count: data.count,
        pages: pages
      });
    });
  })
  .catch(next);
});

// Send chat request to user
router.post('/send_request', (req, res, next) => {
  let input = req.body;
  input.TCHAT_REQUEST_Status = 'Request';
  Chatrequest.findAll({
    where: {
      TCHAT_REQUEST_Sender: input.TCHAT_REQUEST_Sender,
      TCHAT_REQUEST_Receiver: input.TCHAT_REQUEST_Receiver,
      TCHAT_REQUEST_IS_Delete: false
    }
  })
  .then((chatReqResponse) => {
    if (chatReqResponse.length == 0){
      Chatrequest.create(input)
      .then((response) => {
        input['TChat_Log_Chat_Request_ID'] = response.toJSON().TCHAT_REQUEST_Chat_Request_ID;
        input['TChat_Log_Sender'] = response.toJSON().TCHAT_REQUEST_Sender;
        input['TChat_Log_Receiver'] = response.toJSON().TCHAT_REQUEST_Receiver;
        input['TChat_Log_Status'] = response.toJSON().TCHAT_REQUEST_Status;
      
        return Chatlog.create(input)
        .then((createdLog) => {
          const createdLogInJSON = createdLog.toJSON();
          return createdLogInJSON;
        });
      })
      .then((completeResponse) => {
        successHandler("Request sent", res);
      })
      .catch(next);
    } else {
      successHandler("Request already sent", res);
    }
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

