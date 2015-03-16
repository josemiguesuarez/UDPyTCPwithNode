
/*We need to manually start angular as we need to
wait for the google charting libs to be ready*/  
google.setOnLoadCallback(function () {  });
google.load("visualization", "1", {packages:["gauge"]});



var map;
var infoWindow;
var markers = [];
// place a marker
function setMarker (map, position, title, content) {
    deleteMarkers()
    var marker;
    var markerOptions = {
        position: position,
        map: map,
        title: title,
        icon: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
    };

    marker = new google.maps.Marker(markerOptions);
    markers.push(marker); // add marker to array
    
    google.maps.event.addListener(marker, 'click', function () {
        // close window if not undefined
        if (infoWindow !== void 0) {
            infoWindow.close();
        }
        // create new window
        var infoWindowOptions = {
            content: content
        };
        infoWindow = new google.maps.InfoWindow(infoWindowOptions);
        infoWindow.open(map, marker);
    });

}
// Sets the map on all markers in the array.
function setAllMap(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
}
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  setAllMap(null);
}
function deleteMarkers() {
  clearMarkers();
  markers = [];
}


var dataChart, options, chart;

function drawChart() {

    dataChart = google.visualization.arrayToDataTable([
        ['Label', 'Value'],
        ['Velocidad', 80]
        ]);

    options = {
        redFrom: 80, redTo: 100,
        yellowFrom:60, yellowTo: 80,
        minorTicks: 5
    };

    chart = new google.visualization.Gauge(document.getElementById('chart_div'));

    chart.draw(dataChart, options);



}



// public/core.js
var app = angular.module('app', [])

.directive('myMap', function() {
    // directive link function
    var link = function(scope, element, attrs) {        
        // map config
        var mapOptions = {
            center: new google.maps.LatLng(4.61753, -74.09937),
            zoom: 10,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            scrollwheel: false
        };

        if (map === void 0) {
            map = new google.maps.Map(element[0], mapOptions);
        }  
    };
    
    return {
        restrict: 'A',
        template: '<div id="gmaps" style="float:left;width: 590px;height: 100%;"></div>',
        replace: true,
        link: link
    };
})
.directive('myChart', function() {
    return{
        restrict : "A",
        template: '<div id="chart_div" style="float:left;width: 358px;height: 100%;"></div>',
        replace: true,
        link: function($scope, $elem, $attr){
            drawChart();
        }
    }
})

.controller('appCtrl', ['$scope', '$http','$location', function($scope, $http, $location) {


    console.log("se ha cambiado la posición");
    $scope.formData = {};

    $scope.update = function(){ 
        $http.get('/api/StatusModel')
        .success(function(data) {
            $scope.statusLog = data;
            console.log(data);
            var statusActual =  data[data.length-1];
            if(statusActual){
                setMarker(map, new google.maps.LatLng(statusActual.lat,statusActual.lng), 'Posición Actual', statusActual.alt);
                
                dataChart.setValue(0, 1, statusActual.vel);
                chart.draw(dataChart, options);
            }
            

        })
        .error(function(data) {
            console.log('Error: ' + data);
        });
    }
    $scope.update();
    $scope.refresh = false;

    setInterval(function() {
        if($scope.refresh){
            $scope.update();
        }   
    }, 1000);


    $scope.deleteStatus = function(status){
        $scope.confirmDialog(
            'Esta seguro de eliminar el registro: ' 
            + status._id , 

            function(){
                $http.delete('/api/StatusModel/' + status._id)
                .success(function(data) {
                    $scope.statusLog = data;
                    console.log(data);
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
            })
    }
    $scope.eleiminarRegistros = function(){
        $scope.confirmDialog(
            'Esta seguro de eliminar todos los registros', 

            function(){
                $http.delete('/api/StatusModel')
                .success(function(data) {
                    $scope.statusLog = data;
                    console.log(data);
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
            })
    }

    $scope.showType  = function(type){
        $scope.typeToShow = type;
    }





    
    $scope.confirmDialog = function( msg , next){
        $scope.showDialog = true;
        $scope.dialogMsg = msg;
        $scope.nextAfterConfimr = next;
    }

    
    $scope.openPage = function(url){
        window.location.href ='api/doc/' + url;
        //window.open('api/doc/' + url,'_blank');
    }
    $scope.generarReporte = function(){
        //window.location.href ='api/informe.csv';
        window.open('api/informe.csv','_blank');
    }


    $scope.logout = function(){
        $http.post('/logout', {})
        .success(function(data, status, headers, config) {
            $location.url('/');
        })
        .error(function(data, status, headers, config) {
        });
    }
    $scope.dateFromObjectId = function (objectId) {
        return new Date(parseInt(objectId.substring(0, 8), 16) * 1000);
    };

}]);









