const router = require('express').Router();
const passport = require('passport');
const moment = require('moment');
const Chatroom = require('../../model/chatroom');
const Userroom = require('../../model/Userroom');
const Chatlog = require('../../model/chatlog');
const User = require('../../model/user');
const Message = require('../../model/message');
const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const map = require ('lodash/map');
const each = require ('lodash/forEach');
const _ = require('underscore');


module.exports = {
    createMessage: function(data, callback){
        let createMsgJson = {
            TMESSAGES_Content: data.msg,
            TMESSAGES_UID: data.userId,
            TMESSAGES_Chat_Room_ID: data.chatRoomId             
        }
        Message.create(createMsgJson).then((msgRep) => {    
                      
            let chatLogInput = {
                "TChat_Log_Chat_Request_ID": 0,
                "TChat_Log_Chat_Room_ID": data.chatRoomId,
                "TChat_Log_Receiver": data.userId
            };
            createUserLogs(data, chatLogInput, callback);
        })
    }
}

//Create user losgs
function createUserLogs(data, chatLogInput, callback){    
    Chatlog.create(chatLogInput).then((chatLogResponse) => {
        const dataObj = chatLogResponse.get({plain:true});        
        callback(null, dataObj);                    
    })    
}