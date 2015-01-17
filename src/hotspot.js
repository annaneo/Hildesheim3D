


Hotspot = function (parameters) {

    if (parameters === undefined) parameters = {};
    this.infoContent = parameters.hasOwnProperty('content') ? parameters['content'] : "some <a href=\"#\">content</a>";

    var cubeGeometry = new THREE.BoxGeometry(5, 30, 30);
    var cubeMaterial = new THREE.MeshBasicMaterial( { color: 0x000088 } );
    THREE.Mesh.call(this, cubeGeometry, cubeMaterial );
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


