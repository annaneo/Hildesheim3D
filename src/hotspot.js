/**
 * (C)  Julius Peinelt
 *      Anna Neovesky
 */

/**
 * Describes a clickable object in a location that shows a popup with information.
 * @param parameters Object which should have fields: ...
 * @constructor
 */
Hotspot = function (parameters) {

    if (parameters === undefined) parameters = {};

    this.infoContent = parameters.hasOwnProperty('content') ? parameters['content'] : "No content";
    this.infoTitle = parameters.hasOwnProperty('title') ? parameters['title'] : "";
    this.infoImages = parameters.hasOwnProperty('images') ? parameters['images'] : [];

    //sets audio
    if (parameters.hasOwnProperty('audio')) {
        var audioControls = document.getElementById('audioPlayer');
        var s = parameters['audio'];
        var audioSourceOgg = document.getElementById('audioSourceOgg');
        audioSourceOgg.src = s + ".ogg";
        var audioSourceMp3 = document.getElementById('audioSourceMp3');
        audioSourceMp3.src = s + ".mp3";

    }

    this.tooltip = parameters.hasOwnProperty('tooltip') ? parameters['tooltip'] : null;

    /*
    load content via
     this.infoContent.load(parameters['content'], function (response, status, xhr) {
        content.html(response);
     });
     */

    // setting size and material of hotspot icon in panorama
    var geometry = new THREE.PlaneGeometry(16, 16);
    var material = new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture("resources/icons/information.png"),
        transparent: true

    });
    THREE.Mesh.call(this, geometry, material);
    this.position.set(parameters.position.x, parameters.position.y, parameters.position.z);

};

Hotspot.prototype = Object.create(THREE.Mesh.prototype);

/**
 * Renders Pop Up Window
 */
Hotspot.prototype.onClick = function () {
    //init info view
    var infoView = document.getElementById('infoView');
    // position of pop up

    infoView.style.display = "block";

    //set title
    var infoTitle = document.getElementById('infoTitle');
    infoTitle.innerHTML = this.infoTitle;
    //set text content
    var infoContent = document.getElementById('infoContent');
    infoContent.innerHTML = this.infoContent;

    //TODO: able to load more than 1 picture
    if (this.infoImages.length > 0) {
        var infoImageBox = document.getElementById('infoImageBox');
        infoImageBox.style.visibility = 'visible';
        //set image
        var infoImage = document.getElementById('infoImage');
        infoImage.src = this.infoImages[0].figure;
        //set caption
        var infoCaption = document.getElementById('infoCaption');
        infoCaption.innerText = this.infoImages[0].caption;
    } else {
        var infoImageBox = document.getElementById('infoImageBox');
        infoImageBox.style.visibility = 'hidden';
    }
};


