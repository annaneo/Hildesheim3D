


InfoLabel = function (parameters) {

    if (parameters === undefined) parameters = {};
    this.panoImg = parameters.hasOwnProperty('panoImg') ? parameters['panoImg'] : "";

    var cubeGeometry = new THREE.BoxGeometry( 50, 50, 50 );
    var cubeMaterial = new THREE.MeshBasicMaterial( { color: 0x000088 } );
    THREE.Mesh.call(this, cubeGeometry, cubeMaterial );
};


InfoLabel.prototype = Object.create(THREE.Mesh.prototype);

InfoLabel.prototype.onClick = function () {
    if (this.panoImg !== "") {
        init(this.panoImg);
    }
};
