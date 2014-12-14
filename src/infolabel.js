


InfoLabel = function (parameters) {

    if (parameters === undefined) parameters = {};
    this.panoImg = parameters.hasOwnProperty('panoImg') ? parameters['panoImg'] : "";

    var cubeGeometry = new THREE.BoxGeometry(30, 30, 30);
    var cubeMaterial = new THREE.MeshBasicMaterial( { color: 0x000088 } );
    THREE.Mesh.call(this, cubeGeometry, cubeMaterial );
};


InfoLabel.prototype = Object.create(THREE.Mesh.prototype);

InfoLabel.prototype.onClick = function () {
    var infoView = document.getElementById('infoView');
    infoView.style.display = "block";
    infoView.style.left = 100 + "px";
    infoView.style.top = 100 + "px";

};


