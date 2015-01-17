/**
 * Describes a clickable object in a location that allows users to navigate between locations.
 * @param parameters Object with should have fields: ...
 * @constructor
 */
Transition = function (parameters) {

    if (parameters === undefined) parameters = {};
    this.panoImg = parameters.hasOwnProperty('panoImg') ? parameters['panoImg'] : "";

    var cubeGeometry = new THREE.BoxGeometry(30, 30, 1);
    var cubeMaterial = new THREE.MeshBasicMaterial( { color: 0x008800 } );
    THREE.Mesh.call(this, cubeGeometry, cubeMaterial );
    this.position.set(parameters.position.x, parameters.position.y, parameters.position.z);
};


Transition.prototype = Object.create(THREE.Mesh.prototype);

Transition.prototype.onClick = function () {
    if (this.panoImg !== "") {
        init(this.panoImg);
    }
};
