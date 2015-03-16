
var intereptor = function ($q, $location){
	return {

		'responseError': function(rejection) {
			if (rejection.status === 401) {
				$location.url('/');
			}
			return $q.reject(rejection);
		}
	};
}
var checkLoggedin = function($q, $timeout, $http, $location, $rootScope){ 

	var deferred = $q.defer(); 
	$http.get('/loggedin').success(function(user){ 
		if (user === '0') {
			$rootScope.message = 'You need to log in.'; 
			$timeout(function(){deferred.reject();}, 0);
			if($location.url() !== '/'){
				$location.url('/');
			} 
		}else { 
			$timeout(deferred.resolve, 0);
			redirectInic($location, user);
		} 
	});
}
var redirectInic = function($location, user){
	if(user.type === 'admin'){
		$location.url('/admin');
	}else if(user.type === 'root'){
		$location.url('/users');
	}else if(user.type === 'usuario'){
		$location.url('/user');
	}	
}
var startMaps = function(){
	function initialize() {
		var mapProp = {
			center:new google.maps.LatLng(51.508742,-0.120850),
			zoom:5,
			mapTypeId:google.maps.MapTypeId.ROADMAP
		};
		var map=new google.maps.Map(document.getElementById("googleMap"),mapProp);
	}
	google.maps.event.addDomListener(window, 'load', initialize);
}

var app = angular.module('peGelsa', ['app', 'ngRoute', 'users'])

.config(function($routeProvider, $httpProvider) {
	$routeProvider
	.when('/', {
		controller:'loginCtrl',
		templateUrl:'login.html',
		resolve: { 
			loggedin: checkLoggedin 
		} 
	})
	.when('/admin',{
		controller:'appCtrl',
		templateUrl:'adminView.html',
		resolve: { 
			loggedin: checkLoggedin
		} 
	})
	.when('/user',{
		controller:'appCtrl',
		templateUrl:'userView.html',
		resolve: { 
			loggedin: checkLoggedin 
		} 
	})
	.when('/users',{
		controller:'usersCtrl',
		templateUrl:'users.html',
		resolve: { 
			loggedin: checkLoggedin 
		} 
	})
	.otherwise({
		redirectTo:'/'
	});

	$httpProvider.interceptors.push(intereptor);

})

.controller('loginCtrl', ['$scope', '$http','$location', function($scope, $http, $location) {


	$scope.login = function(){
		$http.post('/login', {username:$scope.user, password: $scope.pass})
		.success(function(data, status, headers, config) {
			redirectInic ($location, data);
		})
		.error(function(data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
	};


}]);


