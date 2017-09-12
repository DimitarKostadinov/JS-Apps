$(() => {

    showView();
    //Attach Event Handlers
    (() => {
        // $('header').find('a[data-target]').click(navigateTo);
        $('#loginForm').submit(loginUser);
        $('#registerForm').submit(registerUser);
        $('#submitForm').submit(createPost);
        $('#catalog').click(function () {
            showSection('Catalog');
            listAllCatalogAds();

        });
        $('#submit').click(function () {
            showSection('Submit');
        })
        $('#myPost').click(function () {
            showSection('MyPosts')
        })
        $('.editLink').click(function () {
            console.log('edit')
        })
        $('.notifications').click(function () {
            $(this).hide();
        });

    })()


    //Show sections for LOGGED IN USER and for Logged Out
    if(sessionStorage.getItem('authtoken')===null){
        userLoggedOut();
    }else{
        userLoggedIn();
    }


    //REGISTER LOGIC
    function registerUser(ev) {
        ev.preventDefault();
        let registerUsername=$('#registerUsername');
        let registerPassword=$('#registerPasswd');
        let registerRepeatPasswd=$('#registerRepeatPasswd');

        let usernameVal=registerUsername.val();
        let passVal=registerPassword.val();
        let repeatPassVal=registerRepeatPasswd.val();
        let regexUsername = new RegExp("^([a-z]{3,})$");
        let regexPassword=new RegExp("^([a-z0-9]{6,})$");
        if (regexUsername.test(usernameVal)) {
            console.log('validUsername');
            if (regexPassword.test(passVal)) {
                if(passVal===repeatPassVal){
                    auth.register(usernameVal,passVal)
                        .then(function (userInfo) {
                            saveSession(userInfo);
                            registerUsername.val('');
                            registerRepeatPasswd.val('');
                            registerPassword.val('');
                            showInfo('User registration successful.');
                            //showView('UserHome'); Veche e izvikano v UserLoggedIn();
                        }).catch(handleError);
                }
            }else{
                showError('Invalid Password');
                return;
            }
        } else {
            showError('Invalid Username');
            return;
        }




    }
    //LOGIN LOGIC
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
    $('#logoutBtn').click(logoutUser);
    //LOGOUT LOGIC
    function logoutUser() {
        auth.logout()
            .then(function () {
                sessionStorage.clear();
                showInfo('Logout successful.');
                userLoggedOut();
            })
    }
    
    function listAllCatalogAds() {
        catalogService.loadCatalogAds()
            .then(function (userInfo) {
                displayCatalog(userInfo)
            }).catch(handleError);

    }
    //Displaying catalog
    function displayCatalog(userInfo) {
        let catalogContainer=$('.posts');
        catalogContainer.empty();
        let number=0;
        for (let catalog of userInfo) {
            if(userInfo.length===0){
                catalogContainer.text('No posts in database');
                return;
            }

            number++;
            let time=catalog._kmd.ect;
            let readyTime=calcTime(time);

            let articleContainer=$('<article class="post">');
            articleContainer.append($('<div class="col rank">').append($('<span>').text(number)));
            articleContainer.append($('<div class="col thumbnail">').append($(`<a href="${catalog['url']}">`).append($(`<img src="${catalog['imageUrl']}">`))))
            articleContainer.append($('<div class="post-content">').append($('<div class="title">').append($(`<a href="${catalog['url']}">${catalog['title']}</a>`)))
                .append($('<div class="details">').append($('<div class="info">').text(`submitted ${readyTime} by ${catalog['author']}`))
                    .append($('<div class="controls">').append($('<ul>').append($('<li class="action">').append($('<a class="commentsLink" href="#">comments</a>'))).append($('<li class="action">').append($('<a class="editLink" href="#" id="editBtn">edit</a>'))).append($('<li class="action">').append($('<a class="deleteLink" value="" href="#">delete</a>')))))));

            $('.deleteLink').click(function () {
                console.log('deleted')
            })
            catalogContainer.append(articleContainer);

        }
    }
    function createPost(ev) {
        ev.preventDefault();
        let url=$('#submitForm #url');
        let urlVal=url.val();
        if(urlVal.length===0){
            showError('Please enter url');
            return;

        }
        let title=$('#submitForm #title');
        let titleVal=title.val();
        if(titleVal.length===0){
            showError('Please enter Title');
            return;
        }
        let image=$('#submitForm #image');
        let imageVal=image.val();
        let comment=$('#submitForm #commentArea');
        let commentVal=comment.val();
        let author=sessionStorage.getItem('username');
        catalogService.createPost(author,titleVal,commentVal,urlVal,imageVal)
            .then(function (postInfo) {
            showInfo('Post Created');
                url.val('');
                title.val('');
                image.val('');
                comment.val('');
            }).catch(handleError);
    }




        function showSection(sectionName) {
            $('.useronly').hide();
            $('#view'+sectionName).show();
        }
    //show One View/section
    function showView() {
        $('.content .useronly').hide();
        anonymous();

    }
    function anonymous() {
        $('.anonymous').show();
        $('#menu').hide();
        $('#profile').hide();
        }

    function userOnly() {
        $('.anonymous').hide();
        showSection('Catalog');
        listAllCatalogAds();
    }


    function userLoggedOut() {
        anonymous();
        showView();
    }

    function userLoggedIn() {
        let username=sessionStorage.getItem('username');
        $('#menu').show();
        $('#profile').show();
        $('#userName').text(username);
        $('.anonymous').hide();
        $('.useronly').show();
        userOnly();
    }
    function calcTime(dateIsoFormat) {
        let diff = new Date - (new Date(dateIsoFormat));
        diff = Math.floor(diff / 60000);
        if (diff < 1) return 'less than a minute';
        if (diff < 60) return diff + ' minute' + pluralize(diff);
        diff = Math.floor(diff / 60);
        if (diff < 24) return diff + ' hour' + pluralize(diff);
        diff = Math.floor(diff / 24);
        if (diff < 30) return diff + ' day' + pluralize(diff);
        diff = Math.floor(diff / 30);
        if (diff < 12) return diff + ' month' + pluralize(diff);
        diff = Math.floor(diff / 12);
        return diff + ' year' + pluralize(diff);
        function pluralize(value) {
            if (value !== 1) return 's';
            else return '';
        }
    }






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