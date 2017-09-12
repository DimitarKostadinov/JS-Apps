function attachEvents() {
    $('#btnLoad').click(loadContact);
    $('#btnCreate').click(addPhone);

    let url = 'https://phonebook-nakov.firebaseio.com/phonebook';

    function addPhone() {
        let req = {
            method: "POST",
            url: url + '.json',
            data: JSON.stringify({
                    person: $('#person').val(),
                    phone: $('#phone').val()
                }
            ),
            success: successAdd
        };
        $.ajax(req);

        function successAdd() {
            $('#person').val('');
            $('#phone').val('');
        }
    }

    function loadContact() {
        let req = {
            method: "GET",
            url: url + '.json',
            success: showEntity,
            error: displayError
        };
        $.ajax(req);

        function showEntity(res) {

            $('#phonebook').empty();
            for (let obj in res) {
                let li = $('<li>');
                let text = `${res[obj]['person']}: ${res[obj]['phone']} `;
                let btn = $('<button>').click(() => {
                    remove(obj)
                }).text('[Delete]');
                li.append(text);
                li.append(btn);
                $('#phonebook').append(li);

            }

            function remove(obj) {
                let req = {
                    method: "DELETE",
                    url: url + '/' + obj + ".json",
                    success: sucDelete,
                    error: displayError
                };
                $.ajax(req);

                function sucDelete() {
                    loadContact()
                }

            }
        }

        function displayError(err) {

        }
    }


}