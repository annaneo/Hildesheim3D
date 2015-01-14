/**
 * A way point marker that allows to change the place via onClick event.
 * @param parameters Dictionary of Parameters needed to create a way point.
 * @constructor
 */
WayPoint = function (parameters) {

    if (parameters === undefined) parameters = {};
    this.panoImg = parameters.hasOwnProperty('panoImg') ? parameters['panoImg'] : "";

    var cubeGeometry = new THREE.BoxGeometry(30, 30, 30);
    var cubeMaterial = new THREE.MeshBasicMaterial( { color: 0x008800 } );
    THREE.Mesh.call(this, cubeGeometry, cubeMaterial );
};


WayPoint.prototype = Object.create(THREE.Mesh.prototype);


/**
 * onClick event initializes a new place.
 */
WayPoint.prototype.onClick = function () {
    if (this.panoImg !== "") {
        init(this.panoImg);
    }
};
