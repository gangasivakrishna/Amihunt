app.controller('searchCtrl', ($scope, $http, $window) => {
    $scope.names = [];
    $scope.suser = {
        status: false,
        data: null
    }
    $scope.search = function(){
        if(!$scope.name){
            return;
        }
        name = $scope.name.trim();
        $http.post('/api/search', {name: name})
        .then(response => {
            $scope.names = response.data.data;
        }, error => {
        });
    }

    $scope.sendme = function(user){
        $http.post('/api/sendme', {id: user._id, name: user.name})
        .then(response => {
            if(response.data.error.status){
                $scope.otp = false;
            }else{
                user.otp = true;
                $scope.otp = true;
            }
        }, error => {
            console.log(error);
        });
    }

    $scope.getDetails = function(user){
        user.otp = false;
        let code = user.code;
        user.code = undefined;
        $http.post('/api/confirm', {code: code})
        .then(response => {
            if(response.data.error.status){

            }else{
                $scope.suser.status = true;
                $scope.suser.data = response.data.data;
            }
        }, error => {
            console.log(error);
        })
    }
})