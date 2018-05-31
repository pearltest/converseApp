const router = require('express').Router();
const passport = require('passport');
const moment = require('moment');
const Chatroom = require('../../model/chatroom');
const Userroom = require('../../model/Userroom');
const Chatlog = require('../../model/chatlog');
const User = require('../../model/user');
const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const map = require ('lodash/map');
const each = require ('lodash/forEach');
const _ = require('underscore');


module.exports = {
    createChatRoom: function(data, callback){
        Chatroom.findAll({
            where: {
              [Op.or]: [{HCHAT_ROOM_Name: data.room1}, {HCHAT_ROOM_Name: data.room2}]
            },
            raw: true
        })
        .then((foundRoom) => {  
            if(foundRoom.length == 0){
                return Chatroom.create({HCHAT_ROOM_Name: data.room})
                .then((createdRoom) => {
                    const createdRoomInJSON = createdRoom.toJSON();
                    let resArr = []; 
                    let chatRoomData = resArr.push(createdRoomInJSON);
                    return resArr;
                });
            }else{
                return foundRoom;
            }
        })
        .then((completeRoomCreation) => {
            callback(null, completeRoomCreation);
        });
    },

    joinUserToChatRoom: function(data, callback){
        let roomId = data.roomData[0].HCHAT_ROOM_Chat_Room_ID;
        _.forEach(data.roomUsers, function(userId) {            
            let inputJson = {
                DUSER_ROOM_UID: userId,
                DUSER_ROOM_Chat_Room_ID: roomId
            };
            Userroom.findAll({
                where: inputJson,
                raw: true
            })
            .then((foundUserRoom) => {
                 
                if(foundUserRoom.length == 0){
                    return Userroom.create(inputJson)
                    .then((joinedUserRoom) => {
                        const joinedUserRoomInJSON = joinedUserRoom.toJSON();
                        let resArr = []; 
                        return resArr.push(joinedUserRoomInJSON);
                    });
                }else {
                    return foundUserRoom;
                }         
            })
            .then((joinedUserRes) => {
                callback(null, joinedUserRes);
            });
        });        
    }
}
