/**
 * Created by annaneovesky on 15.11.14.
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


Place.prototype.addInfoLabel = function (parameters) {
	var label = new InfoLabel(parameters);
	this.add(label);

	//var cubeGeometry = new THREE.BoxGeometry(20, 20, 20);
	//var glowMaterial = new THREE.ShaderMaterial(THREE.GlowShader);
	//var glow = new THREE.Mesh(cubeGeometry.clone(), glowMaterial.clone());
	//glow.position.set(parameters.position.x, parameters.position.y, parameters.position.z);
	//glow.scale.multiplyScalar(1.1);
	//this.add(glow);
	//glow.material.uniforms.viewVector.value = new THREE.Vector3().subVectors(new THREE.Vector3(0, 0, 0), glow.position);
	//glow.visible = true;


	return label;
};
