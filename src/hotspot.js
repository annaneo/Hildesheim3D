/**
 * Describes a clickable object in a location that shows a popup with information.
 * @param parameters Object which should have fields: ...
 * @constructor
 */
Hotspot = function (parameters) {

    if (parameters === undefined) parameters = {};

    this.infoContent = parameters.hasOwnProperty('content') ? parameters['content'] : "some <a href=\"#\">content</a>";
    if (parameters.hasOwnProperty('audio')) {
        var audioSource = document.getElementById('audioSource');
        var s = parameters['audio'];
        audioSource.src = s;
    }

    this.tooltip = parameters.hasOwnProperty('tooltip') ? parameters['tooltip'] : null;

    /*
    load content via
     this.infoContent.load(parameters['content'], function (response, status, xhr) {
        content.html(response);
     });
     */

    var geometry = new THREE.PlaneGeometry(30, 30);
    var material = new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture("resources/icons/infopoint.png"),
        transparent: true,
        opacity: 1,
        color: 0xFF0000
    });
    THREE.Mesh.call(this, geometry, material);
    this.position.set(parameters.position.x, parameters.position.y, parameters.position.z);

};


Hotspot.prototype = Object.create(THREE.Mesh.prototype);

Hotspot.prototype.onClick = function () {
    var infoContent = document.getElementById('infoContent');
    infoContent.innerHTML = this.infoContent;
    var infoView = document.getElementById('infoView');
    infoView.style.display = "block";
    infoView.style.left = 100 + "px";
    infoView.style.top = 100 + "px";
};


