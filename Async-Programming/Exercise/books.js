function attachEvents() {
    const serviceUrl = 'https://baas.kinvey.com/appdata/kid_H1Wbp8yw-';
    const kinveyUsername = "mitko";
    const kinveyPassword = "mitko";
    const base64auth = btoa(kinveyUsername + ":" + kinveyPassword);
    const authHeaders = {
        "Authorization": "Basic " + base64auth,
        "Content-type": "application/json"
    };
    $('.load').click(loadAllBooks);
    $('.add').click(createBook);

    function request(method, endpoint, data) {
        return $.ajax({
            method: method,
            url: serviceUrl + endpoint,
            headers: authHeaders,
            data: JSON.stringify(data)
        })
    }

    function loadAllBooks() {
        request('GET','/books')
            .then(displayAllBooks)
            .catch(handleError)
    }

    function displayAllBooks(data) {
        let books = $('#books');
        books.empty();
        for (let el of data) {
            books.append($(`<div class="books" data-id="${el._id}">`)
                .append($('<label>')
                    .text('Author'))
                .append($(`<input type="text" class="author" value="${el['author']}"/>`))
                .append($('<label>')
                    .text('Title'))
                .append($(`<input type="text" class="title" value="${el['title']}"/>`))
                .append($('<label>')
                    .text('ISBN'))
                .append($(`<input type="text" class="isbn" value="${el['isbn']}"/>`))
                .append($('<button class="update">Update</button>').click(updateBook))
                .append($('<button class="delete">Delete</button>').click(deleteBook)))
        }
    }

    function updateBook() {
        let catchEl=$(this).parent();
        let dataObj=createDataJson(catchEl);
        request('PUT',`/books/${catchEl.attr('data-id')}`,dataObj)
            .then(loadAllBooks)
            .catch(handleError)

    }

    function deleteBook() {
        let catchEl=$(this).parent();
        let dataObj=createDataJson(catchEl);
        request('DELETE',`/books/${catchEl.attr('data-id')}`,dataObj)
            .then(loadAllBooks)
            .catch(handleError)
    }
    function createBook() {
        let catchEl=$('#addForm');
        let dataObj=createDataJson(catchEl)
        request('POST','/books',dataObj)
            .then(loadAllBooks)
            .catch(handleError)
    }

    function createDataJson(catchEl) {
        return{
            author:catchEl.find('.author').val(),
            title:catchEl.find('.title').val(),
            isbn:catchEl.find('.isbn').val(),
        }
    }

    function handleError(err) {
        alert(`Error : ${err.statusText}`);
    }

}
