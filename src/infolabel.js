


InfoLabel = function (message, parameters) {

    if (parameters === undefined) parameters = {};
    var fontface = parameters.hasOwnProperty("fontface") ?
        parameters["fontface"] : "Arial";
    var fontsize = parameters.hasOwnProperty("fontsize") ?
        parameters["fontsize"] : 18;
    var borderThickness = parameters.hasOwnProperty("borderThickness") ?
        parameters["borderThickness"] : 4;
    var borderColor = parameters.hasOwnProperty("borderColor") ?
        parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };
    var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
        parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };


    var canvas = document.createElement('canvas');

    var context = canvas.getContext('2d');
    context.font = "Bold " + fontsize + "px " + fontface;

    var metrics = context.measureText( message );
    var textWidth = metrics.width;
    // background color
    context.fillStyle = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
                        + backgroundColor.b + "," + backgroundColor.a + ")";
    // border color
    context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
                        + borderColor.b + "," + borderColor.a + ")";
    context.lineWidth = borderThickness;
    context.rect(borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 1.4 + borderThickness);
    context.fill();
    context.stroke();
    // text color
    context.fillStyle = "rgba(0, 0, 0, 1.0)";
    context.fillText( message, borderThickness, fontsize + borderThickness);

    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    var material = new THREE.SpriteMaterial({
        map: texture,
        useScreenCoordinates: false
    });

    THREE.Sprite.call(this, material);
    this.scale.set(200, 100, 0);
};


InfoLabel.prototype = Object.create(THREE.Sprite.prototype);
