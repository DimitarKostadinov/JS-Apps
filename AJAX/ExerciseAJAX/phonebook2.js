function attachEvents() {
    $('#btnLoad').click(loadContacts);
    function loadContacts() {
        let req = {
            method: 'GET',
            url: 'https://phonebook-nakov.firebaseio.com/phonebook.json',
            success: displayContacts
        };
        $.ajax(req)
    }

    function displayContacts(data) {
        $('#phonebook').empty();
        let list = $('#phonebook');
        for (let contact in data) {
            list.append($(`<li>${data[contact].person}: ${data[contact].phone} </li>`).append(
                $('<button>').text('Delete').on('click', function () {
                        deleteContact(contact);
                    }
                )));
        }
    }
    function deleteContact(contact) {
        let req={
            method:'DELETE',
            url: `https://phonebook-nakov.firebaseio.com/phonebook/${contact}.json`,
            success:loadContacts
        }
        $.ajax(req)
    }
    $('#btnCreate').click(createContact);
    function createContact() {
        let person = $('#person').val();
        let phone = $('#phone').val();
        $('#person').val("");
        $('#phone').val("");
        let req = {
            url: 'https://phonebook-nakov.firebaseio.com/phonebook.json',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                person,
                phone
            }),
            success: loadContacts
        };

        $.ajax(req);

    }
}