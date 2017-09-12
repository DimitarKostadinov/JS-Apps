$(() => {
    showView('AppHome');

    //Attach Event Handlers
    (() => {
        $('header').find('a[data-target]').click(navigateTo);
        $('#formRegister').submit(registerUser);
        $('#formLogin').submit(loginUser);
        $('#formSendMessage').submit(sendMessage);
        $('#linkMenuLogout').click(logoutUser);

        $('.notifications').click(function () {
            $(this).hide();
        });

        //LOAD RECEIVED MESSAGES
        $('#linkUserHomeMyMessages').click(function () {
            showView('MyMessages');
            loadReceivedMessages();
        });
        $('#linkMenuMyMessages').click(loadReceivedMessages);
        //LOAD RECEIVED MESSAGES


        //{{{{LOAD SENT MESSAGES
        $('#linkUserHomeArchiveSent').click(function () {
            showView('ArchiveSent');
            loadSentMessages();
        });
        $('#linkMenuArchiveSent').click(loadSentMessages);
        //LOAD SENT MESSAGES}}}}





        $('#linkUserHomeSendMessage').click(function () {
            showView('SendMessage');
            loadAllUsers();

        });
        $('#linkMenuSendMessage').click(loadAllUsers);




    })()


    //Show sections for LOGGED IN USER and for Logged Out
    if(sessionStorage.getItem('authtoken')===null){
        userLoggedOut();
    }else{
        userLoggedIn();
    }

    function navigateTo() {
        let viewName=$(this).attr('data-target');
        showView(viewName);
    }
    function showView(viewName) {
        $('main > section').hide();
        $('#view'+viewName).show();
    }
    function userLoggedIn() {
        let username=sessionStorage.getItem('username');
        $('#spanMenuLoggedInUser').text(`Welcome, ${username}!`);
        $('#viewUserHomeHeading').text(`Welcome, ${username}!`);
        $('.anonymous').hide();
        $('.useronly').show();
        showView('UserHome')

    }
    function userLoggedOut() {
        showView('AppHome');
        $('.anonymous').show();
        $('.useronly').hide();
        $('#spanMenuLoggedInUser').text('');
    }

    function registerUser(ev) {
        ev.preventDefault();
        let registerUsername=$('#registerUsername');
        let registerPassword=$('#registerPasswd');
        let registerName=$('#registerName');

        let usernameVal=registerUsername.val();
        let passVal=registerPassword.val();
        let nameVal=registerName.val();


        let re = new RegExp("^([a-z0-9]{5,})$");
        if (re.test(usernameVal)) {
            showInfo('Valid Username')
        } else {
            showError("Invalid Username");
            return;
        }
        auth.register(usernameVal,passVal,nameVal)
            .then(function (userInfo) {
                showInfo('User registration successful!');
                saveSession(userInfo);
                registerUsername.val('');
                registerPassword.val('');
                registerName.val('');
            }).catch(handleError)
    }
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
                showInfo('Login successful.');

            }).catch(handleError);
    }
    function logoutUser() {
        auth.logout()
            .then(function () {
                sessionStorage.clear();
                showView('AppHome');
                showInfo('Logout successful.');
                userLoggedOut();

            }).catch(handleError)
    }

    //LOAD RECEIVED MESSAGES
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
                    .append('<th>Date Received</th>')));
            let tableBody=$('<tbody>');
            for (let msg of myMessages) {
                let tableRow=$('<tr>');
                let sender=formatSender(msg['sender_name'],msg['sender_username']);
                let msgText=msg['text'];
                let msgData=formatDate(msg['_kmd']['lmt']);
                tableRow.append($('<td>').text(sender));
                tableRow.append($('<td>').text(msgText));
                tableRow.append($('<td>').text(msgData));
                tableBody.append(tableRow);
            }
            messagesTable.append(tableBody);
            messagesContainer.append(messagesTable);
        }
    }//LOAD RECEIVED MESSAGES

    //LOAD SENT MESSAGES
    function loadSentMessages() {
        let username=sessionStorage.getItem('username');
    messagesService.loadArchiveMessages(username)
        .then(function (myMessages) {
            displaySentMessages(myMessages)
        }).catch(handleError);


        function displaySentMessages(myMessages) {
            let messagesContainer=$('#sentMessages');
            messagesContainer.empty();
            let messagesTable=$('<table>');
            messagesTable.append($('<thead>')
                .append($('<tr>')
                    .append('<th>To</th>')
                    .append('<th>Message</th>')
                    .append('<th>Date Sent</th>')
                    .append('<th>Actions</th>')));
            let tableBody=$('<tbody>');
            for (let msg of myMessages) {
                let tableRow=$('<tr>');
                let recipient=msg['recipient_username'];
                let msgText=msg['text'];
                let msgData=formatDate(msg['_kmd']['lmt']);
                let deleteBtn=$(`<button value="${msg['_id']}">Delete</button>`).click(deleteMessage);
                tableRow.append($('<td>').text(recipient));
                tableRow.append($('<td>').text(msgText));
                tableRow.append($('<td>').text(msgData));
                tableRow.append($('<td>').append(deleteBtn));
                tableBody.append(tableRow);
            }
            messagesTable.append(tableBody);
            messagesContainer.append(messagesTable);
        }
    }
    function deleteMessage() {
        let messageId=$(this).val();
        messagesService.deleteMessage(messageId)
            .then(function () {
                showInfo('Message deleted.');
                loadSentMessages();
            }).catch(handleError);
    }
    //LOAD SENT MESSAGES


    //SEND MESSAGE FUNCTIONALITY
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
               usersContainer.append($(`<option value="${username}">${fullName}</option>`));
           }
        }
    }
    function sendMessage(ev) {
        ev.preventDefault();
        let rUsernameInput=$('#msgRecipientUsername');
        let rTextInput=$('#msgText');
        let recipient=rUsernameInput.val();
        let msgText=rTextInput.val();
        let senderUsername=sessionStorage.getItem('username');
        let senderName=sessionStorage.getItem('name');
        messagesService.sendMessage(senderUsername,senderName,recipient,msgText)
            .then(function () {
                rTextInput.val('');
                showInfo('Message sent.');
                showView('ArchiveSent');
                loadSentMessages();

            }).catch(handleError)
    }
    //SEND MESSAGE FUNCTIONALITY








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

    // Handle notifications
    $(document).on({
        ajaxStart: () => $("#loadingBox").show(),
        ajaxStop: () => $('#loadingBox').fadeOut()
    });

})