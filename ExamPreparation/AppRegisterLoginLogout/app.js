$(() => {
    showView('AppHome');

    //Attach Event Handlers
    (() => {
        $('header').find('a[data-target]').click(navigateTo);
        $('#formRegister').submit(registerUser);
        $('#formLogin').submit(loginUser);
        $('#linkMenuLogout').click(logoutUser)
    })()

    //******NAVIGATION SYSTEM********\\
    if(sessionStorage.getItem('authtoken')===null){
        userLoggedOut();
    }else{
        userLoggedIn();
    }


    //*****LOGOUT USER******\\
    function logoutUser() {
        auth.logout()
            .then(function () {
                sessionStorage.clear();
                showInfo('Logout successful.');
                userLoggedOut(); //За да редиректне веднага към AppHome
            }).catch(handleError);
    }
    //*****LOGOUT USER******\\

    //*****LOGIN USER******\\
    function loginUser(ev) {
        ev.preventDefault();
        let loginUsername=$('#loginUsername');
        let loginPassword=$('#loginPasswd');

        let usernameVal=loginUsername.val();
        let passVal=loginPassword.val();
        auth.login(usernameVal,passVal)
            .then(function (userInfo) {
                saveSession(userInfo);
                loginUsername.val('');
                loginPassword.val('');
                showInfo('Login successful.')
            }).catch(handleError);
    }
    //*****LOGIN USER******\\


    //*****REGISTER USER******\\
    function registerUser(ev) {
        ev.preventDefault();
        let registerUsername=$('#registerUsername');
        let registerName=$('#registerName');
        let registerPassword=$('#registerPasswd');

        let usernameVal=registerUsername.val();
        let nameVal=registerName.val();
        let passVal=registerPassword.val();

        auth.register(usernameVal,passVal,nameVal)
            .then(function (userInfo) {
                saveSession(userInfo);
                registerUsername.val('');
                registerName.val('');
                registerPassword.val('');
                showInfo('User registration successful.');
                //showView('UserHome'); Veche e izvikano v UserLoggedIn();
            }).catch(handleError);

    }
    //*****REGISTER USER******\\
    
    
    //NAVIGATION\\
    function navigateTo() {
        let viewName=$(this).attr('data-target');
        showView(viewName);
    }
    
    //show One View/section
    function showView(viewName) {
        $('main > section').hide();
        $('#view'+ viewName).show();
    }

    function userLoggedOut() {
        $('#spanMenuLoggedInUser').text('');
        showView('AppHome');
        $('.anonymous').show();
        $('.useronly').hide();
    }

    function userLoggedIn() {
        let username=sessionStorage.getItem('username');
        $('#spanMenuLoggedInUser').text(`Welcome, ${username}!`);
        showView('UserHome');
        $('.anonymous').hide();
        $('.useronly').show();
    }
//******NAVIGATION SYSTEM********\\




    function saveSession(userInfo) {
        let userAuth = userInfo._kmd.authtoken;
        sessionStorage.setItem('authtoken', userAuth);
        let userId = userInfo._id;
        sessionStorage.setItem('userId', userId);
        let username = userInfo.username;
        sessionStorage.setItem('username', username);
        sessionStorage.setItem('name', userInfo['name']);
        userLoggedIn();
    }

    function handleError(reason) {
        showError(reason.responseJSON.description);
    }

    function showInfo(message) {
        let infoBox = $('#infoBox');
        infoBox.text(message);
        infoBox.show();
        setTimeout(() => infoBox.fadeOut(), 3000);
    }

    function showError(message) {
        let errorBox = $('#errorBox');
        errorBox.text(message);
        errorBox.show();
        setTimeout(() => errorBox.fadeOut(), 3000);
    }
    // Handle notifications
    $(document).on({
        ajaxStart: () => $("#loadingBox").show(),
        ajaxStop: () => $('#loadingBox').fadeOut()
    });

})