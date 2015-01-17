Transition = function (parameters) {

    if (parameters === undefined) parameters = {};
    this.panoImg = parameters.hasOwnProperty('panoImg') ? parameters['panoImg'] : "";

    var cubeGeometry = new THREE.BoxGeometry(30, 30, 30);
    var cubeMaterial = new THREE.MeshBasicMaterial( { color: 0x008800 } );
    THREE.Mesh.call(this, cubeGeometry, cubeMaterial );
};


Transition.prototype = Object.create(THREE.Mesh.prototype);

Transition.prototype.onClick = function () {
    if (this.panoImg !== "") {
        init(this.panoImg);
    }
};
