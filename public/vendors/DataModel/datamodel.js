angular.module('MainApp',['ngMaterial'])
.controller('AppCtrl', function($scope, $http, $timeout, $mdSidenav, $mdDialog, $window) {
  $scope.toggleLeft = buildToggler('left');
    $scope.toggleRight = buildToggler('right');
    // $http({
    //   method  : 'GET',
    //   url     : 'http://localhost:8080/Application/'+$scope.appProf.clientID
    // }).then(function successCallback(response) {
    //   console.log('success');
    //   console.log(response.data);
    //   if (response.data == 'ture'){
    //     //DB에 데이터가 있는 경우,
    //     $window.alert('아이디가 존재합니다.')
    //   }else {
    //     //DB에 데이터가 없는 경우,
    //     if ($window.confirm('아이디가 존재 하지 않습니다. 이 아이디로 하시겠습니까?')) {
    //       document.getElementById('clientID').readOnly = true
    //       document.getElementById('clientID').style.color = 'gray'
    //     }
    //   }
    // }, function errorCallback(response) {
    //   console.log('error occuring');
    //   console.log(response);
    // });


    $scope.appProf={
      appName:'PNU Tube',
      ipver4:'255.255.255.255',
      ipver6:'255.255.255.255.255.255',
      description:'동영상 스트리밍 애플리케이션입니다.',
      clientID:'selab',
      clientEmail:'selab@pusan.ac.kr',
      sbtn_notification:true
    };

    $scope.appTypeList=[
            { id:'appType1' , name:'Network Control' },
            { id:'appType2' , name:'Telephony' },
            { id:'appType3' , name:'Signaling' },
            { id:'appType4' , name:'Multimedia Conferencing' },
            { id:'appType5' , name:'Real-Time Interactive' },
            { id:'appType6' , name:'Multimedia Streaming' },
            { id:'appType7' , name:'Broadcast Video' },
            { id:'appType8' , name:'Low-Latency Data' },
            { id:'appType9' , name:'OAM' },
            { id:'appType10' , name:'High-Throughput Data' },
            { id:'appType11' , name:'Standard' },
            { id:'appType12' , name:'Low-Priority' }
    ];
});
