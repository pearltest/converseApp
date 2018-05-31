var express = require('express'); 
var app = express();
var fs = require('fs'); 

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
  
const User = require('../../model/user');
const Chatrequest = require('../../model/chatrequest');
const Chatroom = require('../../model/chatroom');
const Message = require('../../model/message');

const ChatrequestController = require('../controller/chatrequest');
const ChatroomController = require('../controller/chatroom');
const MessageController = require('../controller/message');

const socketEvents = (io) => { 
  var userIdArray = []; 
  var nickname = [];
  var roomname = [];
  var groupname = [];
  var messages = [];
  var i = [];
  var x = [];
  var online_member = [];
  var temp1;
  var temp2;
  var socket_id;
  var socket_data;
  var files_array  = [];
  var expiryTime = 8;
  var routineTime = 1;

  io.on('connection', function(socket){ 

    // creating new user if nickname doesn't exists
    socket.on('new-user', function(data, callback){
      if(nickname[data.username]) {
          callback({success:false});
        }else{
          callback({success:true});       
          socket.username = data.username;
          socket.userAvatar = data.userAvatar;  
          nickname[data.username] = socket;
        }
    });
    
    socket.on('reply-to-chat-request',function(data, callback){
      let room = data.senderUsername +"-"+data.receiverUsername;
      ChatrequestController.UpdateChatRequestStatus( data, function ( err, chatReqRes) {

        if(data.TCHAT_REQUEST_Status == "Accept"){       
          let roomnames = room.split("-");
          let room1 = roomnames[0]+"-"+roomnames[1];
          let room2 = roomnames[1]+"-"+roomnames[0];

          ChatroomController.createChatRoom( {room: room, room1: room1, room2: room2}, function ( err, completeRoomCreation) {   //Create Chat Room
            let chatRoomId = completeRoomCreation[0].HCHAT_ROOM_Chat_Room_ID;
            let roomUsersArr = [];
            roomUsersArr.push(data.senderId);
            roomUsersArr.push(data.receiverId);
            ChatroomController.joinUserToChatRoom({data: data, roomUsers: roomUsersArr, roomData: completeRoomCreation}, function ( err, completeRoomCreation) {
              if(roomname[room1]){
                socket.join(room1);
                socket.emit("1on1-room-name", {roomName: room1, chatRoomId: chatRoomId});
                socket.roomname = room1;
                callback({success:true});
              } else if(roomname[room2]){
                socket.join(room2);
                socket.emit("1on1-room-name", {roomName: room2, chatRoomId: chatRoomId});
                socket.roomname = room2;
                callback({success:true});
              } else {
                socket.join(room);
                socket.emit("1on1-room-name", {roomName: room, chatRoomId: chatRoomId});
                socket.roomname = room;
                callback({success:true});
              }
              roomname[socket.roomname] = socket;             
            });            
          });
        } else {
          callback({success:true});
        }
      });     
    });

      // sending new message
      socket.on('send-message', function(data, callback){
        MessageController.createMessage(data, function ( err, msgResponse) {
          if (nickname[data.username]) {
            if(data.hasMsg){
              io.sockets.to(data.roomname).emit('new-message', data);       
              messages.push(data);
              callback({success:true});
              socket.broadcast.emit('highlight-room', data);  
            }else if(data.hasFile){
              if(data.istype == "image"){         
                socket.emit('new message image', data);
                callback({success:true});
              } else if(data.istype == "music"){
                socket.emit('new message music', data);
                callback({success:true});
              } else if(data.istype == "PDF"){
                socket.emit('new message PDF', data);
                callback({success:true});
              }
              socket.broadcast.emit('highlight-room', data);
            }else{
              callback({ success:false});
            }
          } 
        });          
      });

      socket.on('get-messages-by-roomname',function(data){
        var roommessages = [];
        if(messages && messages.length > 0){
          for(var i = 0 ; i < messages.length ; i++){
            if(messages[i].roomname == data.roomname){
              roommessages.push(messages[i]);
            }
          }
        }
        io.sockets.to(data.roomname).emit('get-messages-by-roomname-response', roommessages);
      })

      socket.on('user-typing',function(data,callback){    
        socket.broadcast.to(data.roomname).emit('user-typing-response',data);
        callback({success:true}); 
      })
  
      socket.on('user-stop-typing',function(data){    
        socket.broadcast.to(data.roomname).emit('user-stop-typing-response',data);      
      })

      // sending 1on1 online members list
      socket.on('get-1on1-online-members', function(data){
        var online_member = [];
        i = Object.keys(nickname);
        if(data && data.roomname){
        var usersname = data.roomname.split("&&");
        for(var j=0;j<i.length;j++ )
        {
          socket_id = i[j];
          socket_data = nickname[socket_id];  
          if(usersname[0] == socket_data.username || usersname[1] == socket_data.username){   
          temp1 = {"username": socket_data.username, "userAvatar":socket_data.userAvatar};
          online_member.push(temp1);    
          } 
        }
        io.sockets.emit('1on1-online-members', online_member);
        }   
      }); 

       // sending online members list
       socket.on('get-online-members', function(data){
        var online_member = [];
        i = Object.keys(nickname);
        for(var j=0;j<i.length;j++ )
        {
          socket_id = i[j];
          socket_data = nickname[socket_id];          
          temp1 = {"username": socket_data.username, "userAvatar":socket_data.userAvatar};
          online_member.push(temp1);            
        }
        io.sockets.emit('online-members', online_member);   
      });

      // disconnect user handling 
      socket.on('disconnect', function () { 
        delete nickname[socket.username];
        online_member = [];
        x = Object.keys(nickname);
        for(var k=0;k<x.length;k++ )
          {
              socket_id = x[k];
          socket_data = nickname[socket_id];      
              temp1 = {"username": socket_data.username, "userAvatar":socket_data.userAvatar};
          online_member.push(temp1);      
          }
        io.sockets.emit('online-members', online_member);             
      });

      socket.on('disconnect-mannual', function (data) {  
        delete nickname[data.username];
        online_member = [];
        x = Object.keys(nickname);
        for(var k=0;k<x.length;k++ )
          {
              socket_id = x[k];
          socket_data = nickname[socket_id];      
              temp1 = {"username": socket_data.username, "userAvatar":socket_data.userAvatar};
          online_member.push(temp1);      
          }
        io.sockets.emit('online-members', online_member);             
      });


    /////////////////////////// Old Socket Services: /////////////////////////////////////////

        
      
     

      


    ///////////////// group ///////////////////////////
    socket.on('join group',function(data,callback){
      socket.join(data.groupname);
      callback({success:true});
    });

    socket.on('create group',function(data,callback){
      if(groupname[data.groupname]){
        callback({success:false});
      } else {
        callback({success:true});           
        socket.groupname = data.groupname;      
        socket.users = data.users;
        groupname[data.groupname] = socket;
        socket.join(data.groupname);
      }
    });

    socket.on('update group',function(data,callback){
      if(groupname[data.groupname]){
        callback({success:true});
        groupname[data.groupname] = data;
      } else {
        callback({success:false});    
      }
    });

 

    

    socket.on('get-group',function(data){
      var groups = [];
      i = Object.keys(groupname);
      for(var j=0;j<i.length;j++ )
      {
        socket_id = i[j];
        socket_data = groupname[socket_id];
        //if(socket_data != null && socket_data.users != null && socket_data.users.length > 0){
        //  for(var k=0;k < socket_data.users.length ; k++){
        //    if(socket_data.users[k].username == data.username){
              temp2 = {"groupname": socket_data.groupname, "users":socket_data.users};
              groups.push(temp2);
        //    }
        //  }
        //}
      }   
      io.sockets.emit('online-group', groups);
    });

    socket.on('get-group-byname',function(data,callback){
      socket_data = groupname[data.groupname];    
      temp2 = {"groupname": socket_data.groupname, "users":socket_data.users};
      io.sockets.to(data.groupname).emit('get-group-byname-response', temp2);
      callback({success:true});
    });

    

    
    socket.on('create 1on1 room', function(room, callback) {      
      var roomnames = room.split("-");
      var room1 = roomnames[0]+"-"+roomnames[1];
      var room2 = roomnames[1]+"-"+roomnames[0];

        
          if(roomname[room1]){
            socket.join(room1);
            socket.emit("1on1-room-name", room1);
            socket.roomname = room1;
            callback({success:true});
          } else if(roomname[room2]){
            socket.join(room2);
            socket.emit("1on1-room-name", room2);
            socket.roomname = room2;
            callback({success:true});
          } else {
            socket.join(room);
            socket.emit("1on1-room-name", room);
            socket.roomname = room;
            callback({success:true});
          }
          roomname[socket.roomname] = socket;
        
    });



  });

  ///////////////////////UpLOAD////////////////////////////////////////////////

  // route for uploading images asynchronously
  app.post('/v1/uploadImage',function (req, res){
    var imgdatetimenow = Date.now();  
    var form = new formidable.IncomingForm({
          uploadDir: __dirname + '/public/app/upload/images',
          keepExtensions: true
        });

    form.on('end', function() {
        res.end();
      });
      
      form.parse(req,function(err,fields,files){
      var data = { 
          roomname : fields.roomname,
          username : fields.username, 
          userAvatar : fields.userAvatar, 
          repeatMsg : true, 
          hasFile : fields.hasFile, 
          isImageFile : fields.isImageFile, 
          istype : fields.istype, 
          showme : fields.showme, 
          dwimgsrc : fields.dwimgsrc, 
          dwid : fields.dwid,
          serverfilename : baseName(files.file.path), 
          msgTime : fields.msgTime,
          filename : files.file.name,
          size : bytesToSize(files.file.size)
      };
        var image_file = { 
              dwid : fields.dwid,
              filename : files.file.name,
              filetype : fields.istype,
              serverfilename : baseName(files.file.path),
              serverfilepath : files.file.path,
              expirytime : imgdatetimenow + (3600000 * expiryTime)           
        };
      files_array.push(image_file);
      messages.push(data);
      io.sockets.to(data.roomname).emit('new message image', data);
      });
  });

  // route for uploading audio asynchronously
  app.post('/v1/uploadAudio',function (req, res){
    var userName, useravatar, hasfile, ismusicfile, isType, showMe, DWimgsrc, DWid, msgtime;
    var imgdatetimenow = Date.now();
    var form = new formidable.IncomingForm({
          uploadDir: __dirname + '/public/app/upload/music',
          keepExtensions: true
        });


    form.on('end', function() {
        res.end();
      });
      form.parse(req,function(err,fields,files){
      console.log("files : ",files);
      console.log("fields : ", fields);
      var data = { 
          roomname : fields.roomname,
          username : fields.username, 
          userAvatar : fields.userAvatar, 
          repeatMsg : true, 
          hasFile : fields.hasFile, 
          isMusicFile : fields.isMusicFile, 
          istype : fields.istype, 
          showme : fields.showme, 
          dwimgsrc : fields.dwimgsrc, 
          dwid : fields.dwid,
          serverfilename : baseName(files.file.path), 
          msgTime : fields.msgTime,
          filename : files.file.name,
          size : bytesToSize(files.file.size)
      };
        var audio_file = { 
              dwid : fields.dwid,
              filename : files.file.name,
              filetype : fields.istype,
              serverfilename : baseName(files.file.path),
              serverfilepath : files.file.path,
              expirytime : imgdatetimenow + (3600000 * expiryTime)           
        };
      files_array.push(audio_file);
      messages.push(data);
      io.sockets.to(data.roomname).emit('new message music', data);
      });
  });

  // route for uploading document asynchronously
  app.post('/v1/uploadPDF',function (req, res){
    var imgdatetimenow = Date.now();
    var form = new formidable.IncomingForm({
          uploadDir: __dirname + '/public/app/upload/doc',
          keepExtensions: true
        });

    form.on('end', function() {
        res.end();
      });
      form.parse(req,function(err,fields,files){
      var data = { 
          roomname : fields.roomname,
          username : fields.username, 
          userAvatar : fields.userAvatar, 
          repeatMsg : true, 
          hasFile : fields.hasFile, 
          isPDFFile : fields.isPDFFile, 
          istype : fields.istype, 
          showme : fields.showme, 
          dwimgsrc : fields.dwimgsrc, 
          dwid : fields.dwid,
          serverfilename : baseName(files.file.path), 
          msgTime : fields.msgTime,
          filename : files.file.name,
          size : bytesToSize(files.file.size)
      };
        var pdf_file = { 
              dwid : fields.dwid,
              filename : files.file.name,
              filetype : fields.istype,
              serverfilename : baseName(files.file.path),
              serverfilepath : files.file.path,
              expirytime : imgdatetimenow + (3600000 * expiryTime)           
        };
      files_array.push(pdf_file);
      messages.push(data);
      io.sockets.to(data.roomname).emit('new message PDF', data);
      });
  });

  // route for checking requested file , does exist on server or not
  app.post('/v1/getfile', function(req, res){
      var data = req.body.dwid;
      var filenm = req.body.filename;
      var dwidexist = false;
      var req_file_data;
      
      for(var i = 0; i<files_array.length; i++)
      {
          if(files_array[i].dwid == data)
          {
              dwidexist = true;
              req_file_data = files_array[i];
          }
      }

      // CASE 1 : File Exists
      if(dwidexist == true)
      {
        //CASE 2 : File Expired and Deleted
          if(req_file_data.expirytime < Date.now())
          {
            var deletedfileinfo = { 
                  isExpired : true,
                expmsg : "File has beed removed."
              };
                fs.unlink(req_file_data.serverfilepath, function(err){
                    if (err) {
                        return console.error(err);
                    }
                res.send(deletedfileinfo);           
                });
                 var index = files_array.indexOf(req_file_data);
                 files_array.splice(index,1);           
          }else{
            // CASE 3 : File Exist and returned serverfilename in response
              var fileinfo = {
                isExpired : false, 
                filename : req_file_data.filename,            
                serverfilename : req_file_data.serverfilename };
              res.send(fileinfo);
          }
      }else{  
          // CASE 4 : File Doesn't Exists.       
          var deletedfileinfo = { 
                    isExpired : true,
                    expmsg : "File has beed removed."
            };
            res.send(deletedfileinfo);       
          }
  });

  // Routine Clean up call
  setInterval(function() {routine_cleanup();}, (3600000 * routineTime));

  // Size Conversion
  function bytesToSize(bytes) {
      var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
      if (bytes == 0) return 'n/a';
      var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
      if (i == 0) return bytes + ' ' + sizes[i]; 
      return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
  };
  //get file name from server file path
  function baseName(str)
  {
     var base = new String(str).substring(str.lastIndexOf('/') + 1);     
     return base;
  }

  // Routine cleanup function (files delete after specific interval)
  function routine_cleanup()
  {
      for(var i=0; i<files_array.length; i++)
      {
              if(Date.now() > files_array[i].expirytime)
              {
                  fs.unlink(files_array[i].serverfilepath, function(err) 
                            {
                     if (err) {
                         return console.error(err);
                              }
                              });
                     files_array.splice(i,1);
              }
      }
  };
};

module.exports = socketEvents;
