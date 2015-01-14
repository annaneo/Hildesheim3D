/**
 * Created by annaneovesky on 15.11.14.
*/

/**
 * A Place is a complete panorama point with all way and info points.
 * @param panoimg the url to the texture of the panorama.
 * @constructor
 */
Place = function(panoimg) {

	var geometry = new THREE.SphereGeometry(200, 50, 30);
	geometry.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));

	var material = new THREE.MeshBasicMaterial({
		map: THREE.ImageUtils.loadTexture(panoimg)
	});

	THREE.Mesh.call(this, geometry, material);

};

Place.prototype = Object.create(THREE.Mesh.prototype);


// add functions to Place Object with Place.prototype.<functionName> = function (..) {...}

/**
 * adds an info label according to the provided parameters.
 * @param parameters Dictionary which needs field 'content'
 * @returns {InfoLabel} the added info label
 * @see InfoLabel
 */
Place.prototype.addInfoLabel = function (parameters) {
	var label = new InfoLabel(parameters);
	this.add(label);

	return label;
};
