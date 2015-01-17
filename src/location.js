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
