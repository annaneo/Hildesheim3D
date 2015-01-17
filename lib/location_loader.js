/**
 * Created by julius on 15/01/15.
 */

LocationLoader = function () {

};

LocationLoader.prototype = {

    constructor: LocationLoader,

    //TODO: targetList, panoramaData unknown, should check if properties of panoramaData exists
    /**
     * load Location with uid, adds all hotspots and transitions for the location.
     * @param uid UID of Location
     * @param onLoadComplete callback, gets called when loading complete
     */
    loadLocation: function (uid, onLoadComplete) {
        var data = panoramaData.places[uid];

        var place = new Location(data.image);
        for (var i = 0; i < data.hotspots.length; i++) {
            var hData = data.hotspots[i];
            var hParam = {
                position: new THREE.Vector3(hData.posX, hData.posY, hData.posZ),
                content: hData.text
            };
            targetList.push(place.addInfoLabel(hParam));
        }
        for (var i = 0; i < data.transitions.length; i++) {
            var tData = data.transitions[i];
            var tParam = {
                position: new THREE.Vector3(tData.posX, tData.posY, tData.posZ),
                locationIndex: tData.target_location
            };
            targetList.push(place.addTransition(tParam));
        }
        onLoadComplete();
    }
}
