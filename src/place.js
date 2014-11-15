/**
 * Created by annaneovesky on 15.11.14.
 */



function Place(panoimg) {

	var geometry = new THREE.SphereGeometry(500, 60, 40);
	geometry.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));

	var material = new THREE.MeshBasicMaterial({
		map: THREE.ImageUtils.loadTexture(panoimg)
	});

	mesh = new THREE.Mesh(geometry, material);
	return mesh;
}
