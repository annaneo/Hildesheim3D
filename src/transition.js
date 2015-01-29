/**
 * Describes a clickable object in a location that allows users to navigate between locations.
 * @param parameters Object with should have fields: ...
 * @constructor
 */
Transition = function (parameters) {

    if (parameters === undefined) parameters = {};
    this.panoImg = parameters.hasOwnProperty('panoImg') ? parameters['panoImg'] : "";
    this.targetLocation = parameters.hasOwnProperty('targetLocation') ? parameters['targetLocation'] : -1;


    var geometry = new THREE.PlaneGeometry(30, 30);
    var material = new THREE.MeshBasicMaterial( { color: 0x008800 } );
    THREE.Mesh.call(this, geometry, material );
    this.position.set(parameters.position.x, parameters.position.y, parameters.position.z);
};


Transition.prototype = Object.create(THREE.Mesh.prototype);

Transition.prototype.onClick = function () {
    //if (this.panoImg !== "") {
    //    init(this.panoImg);
    //}
    if (this.targetLocation > -1) {
        transitToLocation(this.targetLocation);
    } else {
        console.log("error: targetLocation not specified!!!");
    }
};