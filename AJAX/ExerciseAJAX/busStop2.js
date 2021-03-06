function getInfo() {
    let stopId=$('#stopId').val();
    let list=$('#buses');
    list.empty();
    let getRequest={
      method:'GET',
       url:`https://judgetests.firebaseio.com/businfo/${stopId}.json`,
       success:displayBusStopInfo,
        error:displayError
    };
    $.ajax(getRequest);
    function displayBusStopInfo(busStopInfo) {
        $('#stopName').text(busStopInfo.name);
        let buses=busStopInfo.buses;
        for (let busNumber in buses) {
            let busMinutes=buses[busNumber]
            let liItem=$('<li>');
            liItem.text(`Bus ${busNumber} arrives in ${busMinutes} minutes`)
            liItem.appendTo(list)
        }
    }
    function displayError() {
        $('#stopName').text('Error');
    }

}