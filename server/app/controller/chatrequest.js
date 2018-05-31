const router = require('express').Router();
const passport = require('passport');
const moment = require('moment');
const Chatrequest = require('../../model/chatrequest');
const Chatlog = require('../../model/chatlog');
const User = require('../../model/user');
const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');


module.exports = {
    // Update Accept/Reject chat request status
    UpdateChatRequestStatus: function(data, callback){ 
        
        Chatrequest.findAll({
            where: {
                TCHAT_REQUEST_Chat_Request_ID: data.TCHAT_REQUEST_Chat_Request_ID
            },
            raw: true
        }).then((chatReqResponse) => {

            let updateQuery = {
                TCHAT_REQUEST_Status: data.TCHAT_REQUEST_Status,
                TCHAT_REQUEST_Updated_On: currentTime,
            }
            if(data.TCHAT_REQUEST_Status == 'Reject'){
                updateQuery.TCHAT_REQUEST_IS_Delete = true
            }
            if(chatReqResponse){
                Chatrequest.update(updateQuery, {
                where: {
                    TCHAT_REQUEST_Chat_Request_ID: data.TCHAT_REQUEST_Chat_Request_ID
                }
                }).then((chatReqUpdatedResponse) => {
                         
                    let chatLogInput = {
                        "TChat_Log_Chat_Request_ID": chatReqResponse[0].TCHAT_REQUEST_Chat_Request_ID,
                        "TChat_Log_Sender": chatReqResponse[0].TCHAT_REQUEST_Sender,
                        "TChat_Log_Receiver": chatReqResponse[0].TCHAT_REQUEST_Receiver,
                        "TChat_Log_Status": data.TCHAT_REQUEST_Status
                    };
                    createUserLogs(data, chatLogInput, callback);
                })
            }
        });
    }
}

//Create user losgs
function createUserLogs(data, chatLogInput, callback){
    
    Chatlog.create(chatLogInput).then((chatLogResponse) => {
        const dataObj = chatLogResponse.get({plain:true});        
        chatLogInput.TChat_Log_Status = 'Request';
        Chatlog.update({TChat_Log_IS_Delete: true},{
            where: chatLogInput
        })
        .then((updatedRes) => {
            callback(null, dataObj);
        });                    
    })    
}

