var App = angular.module('ChatRoom',['ngResource','ngRoute','ngStorage','socket.io','ngFileUpload','Controllers','Services'])
.run(["$rootScope", function ($rootScope){
	$rootScope.baseUrl = '10.8.41.209:1337'; //Application URL
}]);
App.config(function ($routeProvider, $socketProvider){
	$socketProvider.setConnectionUrl('10.8.41.209:1337'); // Socket URL

	$routeProvider	// AngularJS Routes
	.when('/v1/', {
		templateUrl: 'app/views/login.html',
		controller: 'loginCtrl'
	})
	.when('/v1/Users', {
		templateUrl: 'app/views/user.html',
		controller: 'userCtrl'
	})
	.when('/v1/ChatRoom', {
		templateUrl: 'app/views/chatRoom.html',
		controller: 'chatRoomCtrl'
	})
	.when('/v1/CreateGroup', {
		templateUrl: 'app/views/createGroup.html',
		controller: 'createGroupCtrl'
	})
	.when('/v1/ChatGroup', {
		templateUrl: 'app/views/chatRoom.html',
		controller: 'chatGroupCtrl'
	})
	.otherwise({		
        redirectTo: '/v1/'	// Default Route
    });
});
