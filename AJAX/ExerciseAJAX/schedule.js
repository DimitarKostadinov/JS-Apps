function solve() {
    let currentId='depot';
    let oldName='';
    function depart() {
    let getRequest={
        method:'GET',
        url:`https://judgetests.firebaseio.com/schedule/${currentId}.json`,
        success:departBus,
        error:departError
    }
    $.ajax(getRequest);
    }
    function arrive() {
        $('#info').find('span').text(`Arriving at ${oldName}`);
        $('#depart').prop('disabled',false);
        $('#arrive').prop('disabled',true);
    }
    function departBus(stopInfo) {
        let stopName=stopInfo.name
        $('#info').find('span').text(`Next stop ${stopName}`)
        currentId=stopInfo.next
        $('#depart').prop('disabled',true);
        $('#arrive').prop('disabled',false);
        oldName=stopName;

    }
    function departError() {
        $('#info').find('span').text("Error");
        $('#depart').prop('disabled',true);
        $('#arrive').prop('disabled',true);
    }

    return {
        depart,
        arrive
    };
}
