var app = angular.module('users', [])

.controller('usersCtrl', ['$scope', '$http','$location', function($scope, $http, $location) {

	$http.get('/api/users')
    .success(function(data) {
        $scope.users = data;
    })
    .error(function(data) {
        console.log('Error: ' + data);
    });

    $http.get('/api/responsables')
    .success(function(data) {
        $scope.responsables = data;
        console.log(data);
    })
    .error(function(data) {
        console.log('Error: ' + data);
    });

    $scope.validPass = function(){
    	return $scope.formData.password === $scope.formData.secondPass;
    }
    $scope.addUser = function(){
    	$http.post('/api/users', {user:$scope.formData})
        .success(function(data, status, headers, config) {
            $scope.formData = {};
            $scope.users = data;
            $scope.newMode=false;
        })
        .error(function(data, status, headers, config) {});
    }
    $scope.editUser = function(user){
    	$scope.formData = user;
    	$scope.newMode=true;
    }

    $scope.logout = function(){
        $http.post('/logout', {})
        .success(function(data, status, headers, config) {
            $location.url('/');
        })
        .error(function(data, status, headers, config) {
        });
    }

}])