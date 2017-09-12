let catalogService  = (() => {
        function loadMyMessages(username) {
            let endpoint = `messages?query={"recipient_username":"${username}"}`;

            return requester.get('appdata', endpoint, 'kinvey');
        }

        function loadArchiveMessages(username) {
            let endpoint = `messages?query={"sender_username":"${username}"}`;

            return requester.get('appdata', endpoint, 'kinvey');
        }

        function deleteMessage(messageId) {
            let endpoint = `messages/${messageId}`;

            return requester.remove('appdata', endpoint, 'kinvey');
        }

        function loadAllUsers() {
            return requester.get('user', '', 'kinvey');
        }

        function sendMessage(sender_username, sender_name, recipient_username, text) {
            let msgData = {
                sender_username,
                sender_name,
                recipient_username,
                text
            };

            return requester.post('appdata', 'messages', 'kinvey', msgData);
        }
        function loadCatalogAds() {
            let endpoint=`posts?query={}&sort={"_kmd.ect": -1}`;
            return requester.get('appdata',endpoint,'kinvey');
        }
        function createPost(author,title,description,url,imageUrl) {
            let userData={
                author,
                title,
                description,
                url,
                imageUrl
            };
            return requester.post('appdata','posts','kinvey',userData)
        }

        return {
            loadCatalogAds,
            createPost,
            loadMyMessages,
            loadArchiveMessages,
            deleteMessage,
            loadAllUsers,
            sendMessage,
            
        }
})()