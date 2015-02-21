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

            //Hotspots
            item.hotspots.forEach(function (hotspot) {
                var hData = hotspot;
                var hParam =  {
                    position: new THREE.Vector3(hData.posX, hData.posY, hData.posZ),
                    content: hData.text,
                    audio: hData.audio,
                    tooltip: hData.tooltip
                };
                location.addHotspot(hParam);
            });

            //Transitions
            item.transitions.forEach(function (transition) {
                var tData = transition;
                var tParam =  {
                    position: new THREE.Vector3(tData.posX, tData.posY, tData.posZ),
                    targetLocation: tData.target_location,
                    tooltip: tData.tooltip
                };
                location.addTransition(tParam);
            });

            // loading map
            for (var i = 0; panoramaData.maps.length; i++) {
                if (panoramaData.maps[i].uid == item.mapUid) {
                    location.configureMap(panoramaData.maps[i]);
                    break;
                }
            }


            onLoadComplete(location);
        });
    }
};
