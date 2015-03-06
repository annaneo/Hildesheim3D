/**
 * Created by annaneovesky on 15.11.14.
*/

/**
 * Describes on point of view where one can look around.
 * @param panoimg Panoramic image.
 * @constructor constructs a Sphere with a specific image as texture.
 */
Location = function (panoimg) {

	var geometry = new THREE.SphereGeometry(200, 50, 30);
	geometry.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));

	var material = new THREE.MeshBasicMaterial({
		map: THREE.ImageUtils.loadTexture(panoimg)
	});

	THREE.Mesh.call(this, geometry, material);

};

Location.prototype = Object.create(THREE.Mesh.prototype);


// add functions to Location Object with Location.prototype.<functionName> = function (..) {...}


Location.prototype.addHotspot = function (parameters) {
	var hotspot = new Hotspot(parameters);
	this.add(hotspot);
	return hotspot;
};

Location.prototype.addTransition = function (parameters) {
	var transition = new Transition(parameters);
	this.add(transition);
	return transition;
};

/**
 * Configures the map for the location
 * @param parameters dictionary that should have field image with the url to the map image.
 */
Location.prototype.configureMap = function (parameters) {
    var map = document.getElementById('map');

    for (var i = map.childNodes.length-1; i > 0; i--) {
        if (map.childNodes[i].id === "mapSpot") {
            map.removeChild(map.childNodes[i]);
        }
    }

    if (parameters.hasOwnProperty('image')) {
        var image = document.getElementById('mapImage');
        image.src = parameters['image'];

    } else {
        console.log("error: no map image provided!");
    }

    if (parameters.hasOwnProperty('mapSpots')) {
        var spots = parameters['mapSpots'];
        // position of map spots is declared in json
        spots.forEach(function (spot) {
            var spotButton = document.createElement("button");
            spotButton.id = "mapSpot";
            spotButton.style.left = spot.mapPosX + "px";
            spotButton.style.top = spot.mapPosY + "px";
            spotButton.addEventListener('click', function (event) {
                event.preventDefault();
                transitToLocation(spot.uid);
            });
            map.appendChild(spotButton);
        });
    }
    map.style.display = "block";
    map.style.right = 0 + "px";
    map.style.top = 10 + "px";
};
