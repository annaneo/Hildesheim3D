/**
 * Created by annaneovesky on 15.11.14.
*/

Place = function(panoimg) {

	var geometry = new THREE.SphereGeometry(500, 60, 40);
	geometry.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));

	var material = new THREE.MeshBasicMaterial({
		map: THREE.ImageUtils.loadTexture(panoimg)
	});

	THREE.Mesh.call(this, geometry, material);
};

Place.prototype = Object.create(THREE.Mesh.prototype);


// add functions to Place Object with Place.prototype.<functionName> = function (..) {...}


Place.prototype.addInfoLabel = function (message, xCoord, yCoord, zCoord) {
	var label = new InfoLabel(message);
	label.position.set(xCoord, yCoord, zCoord);
	this.add(label);
	return label;
}
