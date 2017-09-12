$(() => {
    showView('AppHome');

    //2.Attach Event Handlers
    (() => {
        $('header').find('a[data-target]').click(navigateTo);
        $('#formRegister').submit(registerUser);
        $('#formLogin').submit(loginUser);
        $('#formSendMessage').submit(sendMessage);
        $('#linkMenuLogout').click(logoutUser);
        $('#linkUserHomeMyMessages').click(function () {
            showView('MyMessages');
            loadReceivedMessages();
        })
        $('#linkUserHomeSendMessage').click(function () {
            showView('SendMessage');
            loadAllUsers();
        })
        $('#linkUserHomeArchiveSent').click(function () {
            showView('ArchiveSent');
            loadSentMessages();
            //TODO: Archive MESSAGES
        })
        $('#linkMenuMyMessages').click(loadReceivedMessages);
        $('#linkMenuArchiveSent').click(loadSentMessages);
        $('#linkMenuSendMessage').click(loadAllUsers);
        $('.notification').click(function () {
            $(this).hide();
        })
    })()

    //******NAVIGATION SYSTEM********\\
    if(sessionStorage.getItem('authtoken')===null){
        userLoggedOut();
    }else{
        userLoggedIn();
    }



    //8.1************Load All Users***********//
    function loadAllUsers() {
        messagesService.loadAllUsers()
            .then(function (allUsers) {
                displayUsersInList(allUsers);
            }).catch(handleError);
    }
    function displayUsersInList(allUsers) {
        let usersContainer=$('#msgRecipientUsername');
        usersContainer.empty();
        for (let user of allUsers) {
            let username=user['username'];
            let fullName=formatSender(user['name'],username);
            if(username!==sessionStorage.getItem('username')){
            usersContainer.append($(`<option value="${username}">${fullName}</option>`))
            }
        }
    }
    //8.2************Send Message***********//
    function sendMessage(ev) {
        ev.preventDefault();
        let rUsernameInput=$('#msgRecipientUsername');
        let mTextInput=$('#msgText');
        let senderName=sessionStorage.getItem('name');
        let senderUsername=sessionStorage.getItem('username');
        let recipientUsername=rUsernameInput.val();
        console.log(recipientUsername);
        let msgText=mTextInput.val();
        messagesService.sendMessages(senderUsername,senderName,recipientUsername,msgText)
            .then(function () {
                mTextInput.val('');
                showInfo('Message sent.');
                showView('ArchiveSent');
                loadSentMessages();
            }).catch(handleError);
    }//8.2************Send Message***********//

    //8.************Load All Users***********//


//7.************Received MESSAGE***********//
    function loadSentMessages() {
        let username=sessionStorage.getItem('username');
        messagesService.loadArchiveMessages(username)
            .then(function (myMessages) {
                displaySentMessages(myMessages);
                console.log(myMessages);
            }).catch(handleError);

        function displaySentMessages(myMessages) {
            let messagesContainer=$('#sentMessages');
            messagesContainer.empty();
            let messagesTable=$('<table>');
            messagesTable.append($('<thead>')
                .append($('<tr>')
                    .append('<th>To</th>')
                    .append('<th>Message</th>')
                    .append('<th>Data Sent</th>')
                    .append('<th>Actions</th>')));
            let tableBody=$('<tbody>');
            for (let msg of myMessages) {
                let tableRow = $('<tr>');
                let recipient = msg['recipient_username'];
                let msgText = msg['text'];
                let msgDate = formatDate(msg['_kmd']['lmt']);
                let deleteBtn=$(`<button value="${msg._id}">Delete</button>`).click(deleteMsg);
                tableRow.append($('<td>').text(recipient));
                tableRow.append($('<td>').text(msgText));
                tableRow.append($('<td>').text(msgDate));
                tableRow.append($('<td>').append(deleteBtn));
                tableBody.append(tableRow);
            }

            messagesTable.append(tableBody);
            messagesContainer.append(messagesTable)
        }

    }//7.************Received MESSAGE***********//

    //8.************DELETE MESSAGE Function for the BUTTON***********//
    function deleteMsg() {
    let messageId=$(this).val(); //TODO ВАЖНООО за Id-to $(this)!!!
        messagesService.deleteMessage(messageId)
            .then(function () {
                showInfo('Message deleted.');
                loadSentMessages();
            }).catch(handleError);
    }
//8.************DELETE MESSAGE Function for the BUTTON***********//



    //6.************Received MESSAGE***********//
    function loadReceivedMessages() {
        let username=sessionStorage.getItem('username');
        messagesService.loadMyMessages(username)
            .then(function (myMessages) {
                displayAllMessages(myMessages);
            }).catch(handleError);
        
        function displayAllMessages(myMessages) {
            let messagesContainer=$('#myMessages');
            messagesContainer.empty();
            let messagesTable=$('<table>');
            messagesTable.append($('<thead>')
                .append($('<tr>')
                    .append('<th>From</th>')
                    .append('<th>Message</th>')
                    .append('<th>Data Received</th>')));
            let tableBody=$('<tbody>');
            for (let msg of myMessages) {
                let tableRow = $('<tr>');
                let sender = formatSender(msg['sender_name'], msg['sender_username']);
                let msgText = msg['text'];
                let msgDate = formatDate(msg['_kmd']['lmt']);
                tableRow.append($('<td>').text(sender));
                tableRow.append($('<td>').text(msgText));
                tableRow.append($('<td>').text(msgDate));
                tableBody.append(tableRow);
            }

            messagesTable.append(tableBody);
            messagesContainer.append(messagesTable)
        }
    }//************MESSAGE LOAD***********//


    //5.*****LOGOUT USER******\\
    function logoutUser() {
        auth.logout()
            .then(function () {
                sessionStorage.clear();
                showInfo('Logout successful.');
                userLoggedOut(); //За да редиректне веднага към AppHome
            }).catch(handleError);
    }
    //*****LOGOUT USER******\\

    //4.*****LOGIN USER******\\
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


    //3.*****REGISTER USER******\\
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
    
    
    //1.NAVIGATION\\
    function navigateTo() {
        let viewName=$(this).attr('data-target');
        showView(viewName);
    }
    
    //show One View/section
    function showView(viewName) {
        $('#container').find('#content').hide();
        //$('#view'+ viewName).show();
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
        $('#viewUserHomeHeading').text(`Welcome, ${username}!`);
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
    //HELPER FUNCTION

    function formatDate(dateISO8601) {
        let date = new Date(dateISO8601);
        if (Number.isNaN(date.getDate()))
            return '';
        return date.getDate() + '.' + padZeros(date.getMonth() + 1) +
            "." + date.getFullYear() + ' ' + date.getHours() + ':' +
            padZeros(date.getMinutes()) + ':' + padZeros(date.getSeconds());

        function padZeros(num) {
            return ('0' + num).slice(-2);
        }
    }

    function formatSender(name, username) {
        if (!name)
            return username;
        else
            return username + ' (' + name + ')';
    }
    //HELPER FUNCTION

    // Handle notifications
    $(document).on({
        ajaxStart: () => $("#loadingBox").show(),
        ajaxStop: () => $('#loadingBox').fadeOut()
    });

})