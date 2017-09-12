function startApp() {
    showView('AppHome');

    //Attach Event Handlers
    (() => {
        $('header').find('a[data-target]').click(navigateTo);
        $('#formRegister').submit(registerUser);
        $('#formLogin').submit(loginUser);
        $('#linkMenuLogout').click(logoutUser);

        $('#linkUserHomeShop').click(function () {
            showView('Shop');
            showProducts();
        });
        $('#linkUserHomeCart').click(function () {
            showView('Cart');
            showCart();
        });

        $('#linkMenuShop').click(showProducts);
        $('#linkMenuCart').click(showCart);


        $('.notification').click(function () {
            $(this).hide();
        })
    })()

    //Show sections for LOGGED IN USER and for Logged Out
    if(sessionStorage.getItem('authtoken')===null){
        userLoggedOut();
    }else{
        userLoggedIn();
    }


    function registerUser(ev) {
        ev.preventDefault();
        let registerUsername=$('#registerUsername');
        let registerPassword=$('#registerPasswd');
        let registerName=$('#registerName');

        let usernameVal=registerUsername.val();
        let passVal=registerPassword.val();
        let nameVal=registerName.val();
        auth.register(usernameVal,passVal,nameVal)
            .then(function (userInfo) {
                showInfo('User registration successful!');
                saveSession(userInfo);
                registerUsername.val('');
                registerPassword.val('');
                registerName.val('');
            }).catch(handleError);
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
                showInfo('Logout successful.');
                userLoggedOut();
            })
    }
    
    function showProducts() {
        shopService.loadAllProducts()
            .then(function (productInfo) {
                renderShop(productInfo);
            }).catch(handleError);

    }
    function renderShop(productInfo) {
        let productContainer=$('#shopProducts');
        productContainer.empty();
        let table=$('<table><thead><tr><th>Product</th><th>Description</th> <th>Price</th><th>Actions</th></tr></thead></table>');
        let tableBody=$('<tbody>');
        table.append(tableBody);
        for (let product of productInfo) {
            let purchaseButton = $("<button>Purchase</button>")
                .click(purchaseProduct.bind(null, product));
            let tableRow=$('<tr>');
            tableRow
                .append($('<td>').text(product['name']))
                .append($('<td>').text(product['description']))
                .append($('<td>').text(Number(product['price']).toFixed(2)))
                .append($('<td>').append(purchaseButton));

            tableBody.append(tableRow);
        }
        table.append(tableBody);
        productContainer.append(table);

    }
    function purchaseProduct(product) {
        shopService.addProduct()
            .then(function (userInfo) {
                updateCart(userInfo)
            }).catch(handleError);

        function updateCart(userInfo) {
            userInfo.cart = userInfo.cart || {};
            if (userInfo.cart.hasOwnProperty(product._id)) {
                userInfo.cart[product._id].quantity = Number(userInfo.cart[product._id].quantity) + 1;
            } else {
                userInfo.cart[product._id] = {
                    quantity: 1,
                    product: {
                        name: product.name,
                        description: product.description,
                        price: product.price
                    }
                }
            }
            shopService.purchasedProduct(userInfo)
                .then(function () {
                    showInfo('Product Purchased!')
                })
        }
    }

    function showCart() {
        shopService.getUser()
            .then(function (userInfo) {
                let products = [];
                let cart=userInfo.cart;
                let keys=Object.keys(cart);
                for (let id of keys) {
                    let product = {
                        _id: id,
                        name: cart[id]['product']['name'],
                        description: cart[id]['product']['description'],
                        quantity: cart[id]['quantity'],
                        totalPrice: Number(cart[id]['quantity']) * Number(cart[id]['product']['price'])
                    };
                    products.push(product);
                    renderCart(products);
                }
            });
        function renderCart(products) {
            let productContainer=$('#cartProducts');
            productContainer.empty();
            let table=$('<table><thead><tr><th>Product</th><th>Description</th><th>Quantity</th> <th>Total Price</th><th>Actions</th></tr></thead></table>');
            let tableBody=$('<tbody>');
            table.append(tableBody);
            for (let product of products) {
                let discardButton = $(`<button value="${product._id}">Discard</button>`)
                    .click(discardProduct);
                let tableRow=$('<tr>');
                tableRow
                    .append($('<td>').text(product['name']))
                    .append($('<td>').text(product['description']))
                    .append($('<td>').text(product['quantity']))
                    .append($("<td>").text((Number(product.quantity) * Number(product.totalPrice)).toFixed(2)))
                    .append($('<td>').append(discardButton));

                tableBody.append(tableRow);
            }
            table.append(tableBody);
            productContainer.append(table);
        }
    }
    function discardProduct() {
        let productId=$(this).val();
        shopService.getUser()
            .then(function (userData) {
                let cart=userData.cart;
                let quantity=Number(cart[productId]['quantity']) - 1;
                if(quantity===0){
                    delete cart[productId];
                }else{
                    cart[productId]['quantity'] = quantity;
                }
                userData['cart']=cart;
                shopService.updateUser(userData)
                    .then(function (userInfo) {
                        showInfo('Product discard');
                        showCart();
                    })
            })
    }





    function navigateTo() {
        let viewName=$(this).attr('data-target');
        showView(viewName);
    }



    //show One View/section
    function showView(viewName) {
        $('main > section').hide();
        $('section > #viewWelcome').show();
    }

    function userLoggedOut() {
        $('#spanMenuLoggedInUser').text('');
        showView('AppHome');
        $('.anonymous').show();
        $('.useronly').hide();
    }

    function userLoggedIn() {
        let username=sessionStorage.getItem('username');
        $('#spanMenuLoggedInUser').text('Welcome,'+username + '!');
        $('#viewUserHomeHeading').text('Welcome,'+username + '!');
        showView('UserHome');
        $('.anonymous').hide();
        $('.useronly').show();
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


}
