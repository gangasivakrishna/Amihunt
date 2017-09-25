app.controller("loginCtrl", ($scope, $http, $window) => {
    $scope.login = function(){
        // console.log($scope.email, $scope.password);
        let user = {
            email: $scope.email,
            password: $scope.password
        }
        $http.post('/users/signin', user)
        .then(response => {
            if(response.data.error.status){
                let error = response.data.error;
                if(error.code === 3){
                    $window.location = '/confirm';
                }
            }else{
                $window.location = '/home';
            }
        }, error => {
            console.log(error);
        });
    }
})
.controller('registerCtrl', ($scope, $http, $window) => {
    $scope.register = function(){
        // console.log($scope.email, $scope.password, $scope.fullname);
        let email = $scope.email;
        let user = {
            name: $scope.fullname,
            email: $scope.email,
            password: $scope.password
        }
        $http.post('/users/signup', user)
        .then(response => {
            if(response.data.error.status){
            }else{
                $http.post('/users/confirm', {email: email})
                .then( response => {
                    if(response.data.error.status){

                    }else{
                        $window.location = '/mailsent';
                    }
                }, error => {
                    console.log(error);
                })
            }
        }, error => {
            console.log(error);
        });
    }
})
.controller('logoutCtrl', ($scope, $http, $window) => {
    $scope.logout = function(){
        $http.get('/logout')
        .then(
            response =>{
                if(response){
                    $window.location = '/login';
                }
            }, error => {
    
            }
        );
    }
})
.controller('sendmailCtrl', ($scope, $http, $window) => {
    $scope.sendmail = function(){
        let email = $scope.email.trim();
        console.log(email);
        $http.post('/users/confirm', {email: email})
        .then( response => {
            console.log(response);
            if(response.data.error.status){

            }else{
                $window.location = '/mailsent';
            }
        }, error => {
            console.log(error);
        })
    }
})

.controller('resetPasswdCtrl', ($scope, $http, $location, $window) => {
    $scope.reset = function(){
        let email = $scope.email;
        if(email){
            email = email.trim();
        }

        $http.post('/users/reset', {email: email})
        .then(response => {
            console.log(response.data);
        }, error => {
            console.log(error);
        })
    }

    $scope.savePassword = function(){
        let url = $location.absUrl();
        let password = $scope.password;
        if(password){
            password = password.trim();
        }

        $http.post(url, {password: password})
        .then(response => {
            console.log(response.data);
        }, error => {
            console.log(error);
        })

    }
})