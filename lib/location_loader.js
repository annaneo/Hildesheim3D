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
        var location;
        panoramaData.locations.forEach(function(item, index) {
            if (item.uid === undefined || uid === undefined) {
                console.log("error: uid undefined");
                return;
            }
            if (item.uid !== uid) {
                return
            }

            location = new Location(item.image);
            for (var i = 0; i < item.hotspots.length; i++) {
                var hData = item.hotspots[i];
                var hParam = {
                    position: new THREE.Vector3(hData.posX, hData.posY, hData.posZ),
                    content: hData.text
                };
                location.addHotspot(hParam);
            }
            for (var i = 0; i < item.transitions.length; i++) {
                var tData = item.transitions[i];
                var tParam = {
                    position: new THREE.Vector3(tData.posX, tData.posY, tData.posZ),
                    targetLocation: tData.target_location
                };
                location.addTransition(tParam);
            }
            onLoadComplete(location);
        });
    }
}
