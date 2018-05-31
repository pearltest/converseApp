angular.module('Controllers',[])
.directive('focusMe', function($timeout) {	// Custom directive for focus
    return {
        link: function(scope, element, attrs) {
          scope.$watch(attrs.focusMe, function(value) {
            if(value === true) { 
              $timeout(function() {
                element[0].focus();
                scope[attrs.focusMe] = false;
              });
            }
          });
        }
    };
})
.controller('loginCtrl', function ($scope, $location, $rootScope, $socket){		// Login Controller
	// Varialbles Initialization.
	$scope.userAvatar = "Avatar1.jpg";
	$scope.isErrorReq = false;
	$scope.isErrorNick = false;
	$scope.username = "";

	// redirection if user logged in.
	if($rootScope.loggedIn){
		$location.path('/v1/Users');
	}

	// Functions for controlling behaviour.
	$scope.redirect = function(){
		if ($scope.username.length <= 20) {
			if($scope.username){
				$socket.emit('new-user',{userId: 1, username : $scope.username, userAvatar : $scope.userAvatar},function(data){
					console.log("@@@@@@@3.new-user@@@@@@@@@")	
					console.log(data)

					if(data.success == true){	// if nickname doesn't exists	
						$rootScope.username = $scope.username;
						$rootScope.userAvatar = $scope.userAvatar;
						$rootScope.loggedIn = true;
						$location.path('/v1/Users');					
					}else{		// if nickname exists
						$scope.errMsg = "Use different nickname.";
						$scope.isErrorNick = true;
						$scope.isErrorReq = true;
						$scope.printErr($scope.errMsg);	
					}			
				});
			}else{		// blanck nickname 
				$scope.errMsg = "Enter a nickname.";
				$scope.isErrorReq = true;
				$scope.printErr($scope.errMsg);
			}
		}else{		// nickname greater than limit
			$scope.errMsg = "Nickname exceed 20 charachters.";
			$scope.isErrorNick = true;
			$scope.isErrorReq = true;
			$scope.printErr($scope.errMsg);
		}
	}

	$scope.printErr = function(msg){	// popup for error message
		var html = '<p id="alert">'+ msg +'</p>';
		if ($( ".chat-box" ).has( "p" ).length < 1) {
			$(html).hide().prependTo(".chat-box").fadeIn(1500);
			$('#alert').delay(1000).fadeOut('slow', function(){
				$('#alert').remove();
			});
		};
	}
	$scope.changeAvatar = function(avatar){		// secting different avatar
			$scope.userAvatar = avatar;
	}
})
.controller('userCtrl', function ($scope, $location, $rootScope, $socket,$localStorage){		// User Controller
	// Varialbles Initialization.
	$scope.users = [];
	$scope.groups = [];
	$scope.isErrorReq = false;
	$scope.isErrorNick = false;
		// ================================== Online Members List ===============================
		$socket.emit('get-online-members',{username:$rootScope.username},function(data){
		});
		$socket.on("online-members", function(data){
			$scope.oldusers= $localStorage.localUsers;		
			console.log($localStorage.localUsers);	
			$scope.users = [];			
			if(data && data.length > 0){
				for(var i = 0 ; i < data.length ;i++){
					data[i].highlight = false;
					if(data[i].username != $rootScope.username){
						$scope.users.push(data[i]);
					}
				}
				if($scope.oldusers && $scope.oldusers.length >  0){
					for(var k = 0 ; k < $scope.oldusers.length ; k++){
						if($scope.users && $scope.users.length > 0){
							for(l = 0 ; l  < $scope.users.length ; l++){
								if($scope.oldusers[k].username == $scope.users[l].username && $scope.oldusers[k].highlight){									
									$scope.users[l].highlight = true;	
									break;								
								}
							}							
						}
						console.log($scope.users);	
						$localStorage.localUsers = $scope.users;																				
					}
				}				
			}					
		});

		$socket.emit('get-group',{username:$rootScope.username},function(data){
		});
		$socket.on("online-group", function(data){
			$scope.oldgroups = $localStorage.localGroups;	
			$scope.groups = [];			
			if(data && data.length > 0){
				for(var i = 0 ; i < data.length ;i++){
					data[i].highlight = false;				
					if(data[i].users != null && data[i].users.length){
						for(var k = 0 ; k < data[i].users.length; k++){
							if(data[i].users[k].username == $rootScope.username){
								$scope.groups.push(data[i]);							
							}
						}																
					}
				}		
				if($scope.oldgroups && $scope.oldgroups.length  > 0){
					for(var l = 0; l < $scope.oldgroups.length ; l++){
						if($scope.groups && $scope.groups.length>0){
							for(var m = 0 ; m  < $scope.groups.length ; m++){
								if($scope.oldgroups[l].groupname == $scope.groups[m].groupname && $scope.oldgroups[l].highlight){
									$scope.groups[m].highlight = true;									
									break;
								}
							}							
						}	
						$localStorage.localGroups = $scope.groups;												
					}
				}		
			}				
		});

		// ================================== 1 on 1 room ===============================
		$socket.on("1on1-room-name", function(data){
			console.log("@@@@@@@2.1on1-room-name@@@@@@@@@")	
			console.log(data)
			$rootScope.roomname = data.roomName;
		});

		$scope.replyToChatRequest = function (requestType){	
			let replyChatReqInput = {
				"TCHAT_REQUEST_Chat_Request_ID": 48,
				"TCHAT_REQUEST_Status": requestType,
				"senderId": 1,
				"receiverId": 2,
				"senderUsername": "test166",
				"receiverUsername": "test761"
			};	
			$socket.emit('reply-to-chat-request', replyChatReqInput, function(data){
				console.log("@@@@@@@1.reply-to-chat-request@@@@@@@@@")	
				console.log(data)	
					
			});					
		}

	$scope.create1on1Room = function (user){
		$scope.roomname = user.username+"-"+$rootScope.username;

	
		if($scope.roomname){
			$socket.emit('create 1on1 room',$scope.roomname,function(data){
				
				if(data.success == true){	// if nickname doesn't exists	
					//$rootScope.roomname = $scope.roomname;					
					//$localStorage.localUsers = $scope.users;					
					$localStorage.localGroups = $scope.groups;					
					if($scope.users && $scope.users.length  >0){
						for(var i = 0 ; i < $scope.users.length ; i++){
							if($scope.users[i].username == user.username){
								$scope.users[i].highlight = false;
								$localStorage.localUsers = $scope.users;
								$location.path('/v1/ChatRoom');	
							}
						}
					}				
				}else{		// if nickname exists
					$scope.errMsg = "Use different roomname.";
					$scope.isErrorNick = true;
					$scope.isErrorReq = true;
					$scope.printErr($scope.errMsg);	
				}			
			});
		}else{		// blanck nickname 
			$scope.errMsg = "Enter a roomname.";
			$scope.isErrorReq = true;
			$scope.printErr($scope.errMsg);
		}		
	}
	
	$scope.joinGroupRoom = function (groupname){
		$socket.emit('join group',{groupname:groupname},function(data){
			if(data.success == true){
				$rootScope.roomname = groupname;
				$localStorage.localUsers = $scope.users;
				$localStorage.localGroups = $scope.groups;
				$location.path('/v1/ChatGroup');
			}
		})
	}

	$scope.goToCreateGroup = function(){
		$localStorage.localUsers = $scope.users;		
		$localStorage.localGroups = $scope.groups;
		$location.path('/v1/CreateGroup');
	}

	$scope.printErr = function(msg){	// popup for error message
		var html = '<p id="alert">'+ msg +'</p>';
		if ($( ".chat-box" ).has( "p" ).length < 1) {
			$(html).hide().prependTo(".chat-box").fadeIn(1500);
			$('#alert').delay(1000).fadeOut('slow', function(){
				$('#alert').remove();
			});
		};
	}	

	// redirection if user is not logged in.
	if(!$rootScope.loggedIn){
		$location.path('/v1/');
	}

	$socket.on('highlight-room',function(data){
		if(data != null && data.username && !data.isGroup && $scope.users && $scope.users.length > 0){
			for(var i = 0 ; i < $scope.users.length ; i++){				
				if($scope.users[i].username == data.username && data.receiverUsername == $rootScope.username){
					$scope.users[i].highlight = true;					
				}
			}
		}
		if(data != null && data.roomname && data.isGroup && $scope.groups && $scope.groups.length > 0){			
			for(var i = 0 ; i < $scope.groups.length ; i++){				
				if($scope.groups[i].groupname == data.roomname){
					$scope.groups[i].highlight = true;
				}
			}
		}
	});

})