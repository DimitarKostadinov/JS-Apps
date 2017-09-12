let shopService  = (() => {




        function deleteMessage(messageId) {
            let endpoint = `messages/${messageId}`;

            return requester.remove('appdata', endpoint, 'kinvey');
        }

        function loadAllProducts() {
            return requester.get('appdata', 'products', 'kinvey');
        }
        function addProduct() {
            let userId=sessionStorage.getItem('userId');
            return requester.get('user',userId,'kinvey');
        }
    function getProduct(productId) {
        return requester.get('appdata', 'products/' + productId, 'kinvey');
    }
    function getUser() {
        let endPoint = sessionStorage.getItem('userId');
        return requester.get('user', endPoint, 'kinvey');
    }

        function purchasedProduct(userInfo) {
            let userId=sessionStorage.getItem('userId');
            return requester.update('user',userId,'kinvey', userInfo);
        }
    function updateUser(userInfo) {
        let endPoint = sessionStorage.getItem('userId');
        return requester.update('user', endPoint, 'kinvey', userInfo)
    }

        return {
            deleteMessage,
            loadAllProducts,
            purchasedProduct,
            addProduct,
            getProduct,
            getUser,
            updateUser
        }
})()