function attachEvents() {
    const serviceUrl = "https://baas.kinvey.com/appdata/kid_B1Jeq-Jv-";
    const kinveyUsername = "mitko";
    const kinveyPassword = "mitko";
    const base64auth = btoa(kinveyUsername + ":" + kinveyPassword);
    const authHeaders = {
        "Authorization": "Basic " + base64auth,
        "Content-type": "application/json"
    };
    $('.load').click(loadAllCatches);
    $('.add').click(createCatches);


    function request(method,endpoint,data) {
        return $.ajax({
            method:method,
            url:serviceUrl + endpoint,
            headers:authHeaders,
            data:JSON.stringify(data)
        })
    }

    function loadAllCatches() {
        request('GET', '/biggestCatches')
            .then(displayAllCatches)
            .catch(handleError)
    }

    function displayAllCatches(data) {
        let catches=$('#catches');
        catches.empty();
        for (let el of data) {
            catches.append($(`<div class="catch" data-id="${el._id}">`)
                .append($('<label>')
                    .text('Angler'))
                .append($(`<input type="text" class="angler" value="${el['angler']}"/>`))
                .append($('<label>')
                    .text('Weight'))
                .append($(`<input type="number" class="weight" value="${el['weight']}"/>`))
                .append($('<label>')
                    .text('Species'))
                .append($(`<input type="text" class="species" value="${el['species']}"/>`))
                .append($('<label>')
                    .text('Location'))
                .append($(`<input type="text" class="location" value="${el['location']}"/>`))
                .append($('<label>')
                    .text('Bait'))
                .append($(`<input type="text" class="bait" value="${el['bait']}"/>`))
                .append($('<label>')
                    .text('Capture Time'))
                .append($(`<input type="number" class="captureTime" value="${el['captureTime']}"/>`))
                .append($('<button class="update">Update</button>').click(updateCatch))
                .append($('<button class="delete">Delete</button>').click(deleteCatch)))
        }
    }
    function updateCatch() {
        let catchEl=$(this).parent();
        let dataObj=createDataJson(catchEl);
        request('PUT',`/biggestCatches/${catchEl.attr('data-id')}`,dataObj)
            .then(loadAllCatches)
            .catch(handleError)

    }
    function deleteCatch() {
        let catchId=$(this).parent();
        request('DELETE',`/biggestCatches/${catchId.attr('data-id')}`)
            .then(loadAllCatches)
            .catch(handleError)
    }
    function createCatches() {
        let catchEl=$('#addForm');
        let dataObj=createDataJson(catchEl);
        request('POST',`/biggestCatches`,dataObj)
            .then(loadAllCatches)
            .catch(handleError)
    }
    function createDataJson(catchEl) {
        return{
            angler:catchEl.find('.angler').val(),
            weight:+catchEl.find('.weight').val(),
            species:catchEl.find('.species').val(),
            location:catchEl.find('.location').val(),
            bait:catchEl.find('.bait').val(),
            captureTime:+catchEl.find('.captureTime').val()
        }
    }


    function handleError() {
       alert("Error");
    }
}