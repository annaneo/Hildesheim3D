/** (c) */

var camera, scene, renderer;

var isUserInteracting = false;
var isPopupOpen = false;
var lon = 0;
var lat = 0;
var lonFactor = 0;
var latFactor = 0;
var phi = 0;
var theta = 0;
var projector;
var mouse = { x: 0, y: 0 };
var targetList = [];
var hoverIntersected;
var composer;


function startPanorama(panoImg) {
	init(panoImg);
	animate();
}


function removePanorama() {
	var container = document.getElementById('panorama');
	if (container.childNodes.length > 0) {
		container.removeChild(container.childNodes[0]);
	}
	targetList = [];
	mouse = { x: 0, y: 0 };
}


function init(panoImg) {
	removePanorama();
	scene = new THREE.Scene();

	var container = document.getElementById('panorama');

	camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight ,1, 1000);
	camera.target = new THREE.Vector3(0, 0, 0);

	// initialize object to perform world/screen calculations
	projector = new THREE.Projector();


	var place = new Place(panoImg);
	//TODO: commented line for demo
	var infoLabelParam = {position: new THREE.Vector3(150, 1, 1)};
	targetList.push(place.addInfoLabel(infoLabelParam));

	scene.add(place);


	if (Detector.webgl) {
		renderer = new THREE.WebGLRenderer( {antialias:true} );
	} else {
		renderer = new THREE.CanvasRenderer();
	}

	renderer.setSize(window.innerWidth, window.innerHeight);
	container.appendChild(renderer.domElement);

	initEventListener();
	setupBlurShader();

}


function initEventListener() {

	THREEx.FullScreen.bindKey({charCode : 'f'.charCodeAt(0)});

	document.addEventListener('mousedown', onDocumentMouseDown, false);
	document.addEventListener('mousemove', onDocumentMouseMove, false);
	document.addEventListener('mouseup', onDocumentMouseUp, false);
	document.addEventListener('mousewheel', onDocumentMouseWheel, false);
	document.addEventListener('DOMMouseScroll', onDocumentMouseWheel, false);

	document.addEventListener('dragover', function (event) {
		event.preventDefault();
		event.dataTransfer.dropEffect = 'copy';

	}, false);

	document.addEventListener('dragenter', function (event) {
		document.body.style.opacity = 0.5;
	}, false);

	document.addEventListener('dragleave', function (event) {
		document.body.style.opacity = 1;
	}, false);

	document.addEventListener('drop', function (event) {
		event.preventDefault();
		var reader = new FileReader();
		reader.addEventListener('load', function (event) {
			material.map.image.src = event.target.result;
			material.map.needsUpdate = true;

		}, false);
		reader.readAsDataURL(event.dataTransfer.files[0]);
		document.body.style.opacity = 1;
	}, false);

	document.addEventListener('keydown', onKeyDown, false);
	document.addEventListener('keyup', onKeyUp, false);

	window.addEventListener('resize', onWindowResize, false);

	document.getElementById('infoCloseButton').addEventListener('click', function (event) {
		var div = document.getElementById("infoView");
		div.style.display = "none";
		isPopupOpen = false;
	}, false);
}


function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseDown(event) {

	if (isPopupOpen) {
		return;
	}

	event.preventDefault();

	// update the mouse variable
	// canvas position has to be 'static'
	mouse.x = ( ( event.clientX - renderer.domElement.offsetLeft ) / renderer.domElement.width ) * 2 - 1;
	mouse.y = - ( ( event.clientY - renderer.domElement.offsetTop ) / renderer.domElement.height ) * 2 + 1;

	// find intersections
	// create a Ray with origin at the mouse position
	//   and direction into the scene (camera direction)
	var vector = new THREE.Vector3(mouse.x, mouse.y, 0);
	projector.unprojectVector( vector, camera );
	var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

	// create an array containing all objects in the scene with which the ray intersects
	var intersects = ray.intersectObjects(targetList);

	// if there is one (or more) intersections
	if ( intersects.length > 0 ) {
		intersects[0].object.onClick();
		isPopupOpen = true;

	} else {
		lonFactor = mouse.x;
		latFactor = mouse.y;
		isUserInteracting = true;
	}
}

function onDocumentMouseMove(event) {
	if (isPopupOpen) {
		return;
	}
	mouse.x = ( ( event.clientX - renderer.domElement.offsetLeft ) / renderer.domElement.width ) * 2 - 1;
	mouse.y = - ( ( event.clientY - renderer.domElement.offsetTop ) / renderer.domElement.height ) * 2 + 1;

	if (isUserInteracting === true) {
		lonFactor = mouse.x;
		latFactor = mouse.y;
	} else {
		// check if mouse intersects something (to let it glow)
		var vector = new THREE.Vector3(mouse.x, mouse.y, 0);
		projector.unprojectVector( vector, camera );
		var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

		// create an array containing all objects in the scene with which the ray intersects
		var intersects = ray.intersectObjects(targetList);

		// if there is one (or more) intersections
		if ( intersects.length > 0 ) {
			if (intersects[0].object != hoverIntersected) {
				if (hoverIntersected) {
					hoverIntersected.material.color.setHex(hoverIntersected.currentHex);
				}
				hoverIntersected = intersects[0].object;
				// store color of closest object (for later restoration)
				hoverIntersected.currentHex = hoverIntersected.material.color.getHex();
				// set a new color for closest object
				hoverIntersected.material.color.setHex(0xffff00);
			}
		} else {
			if (hoverIntersected) {
				hoverIntersected.material.color.setHex(hoverIntersected.currentHex);
			}
			hoverIntersected = null;
		}
	}
}

function onDocumentMouseUp(event) {
	lonFactor = 0;
	latFactor = 0;
	isUserInteracting = false;
}

function onDocumentMouseWheel(event) {
	// WebKit
	if (event.wheelDeltaY) {
		camera.fov -= event.wheelDeltaY * 0.05;

	// Opera / Explorer 9
	} else if (event.wheelDelta) {
		camera.fov -= event.wheelDelta * 0.05;

	// Firefox
	} else if (event.detail) {
		camera.fov += event.detail * 1.0;
	}

	if (camera.fov > 100) {
		camera.fov = 100;
	} else if (camera.fov < 10) {
		camera.fov = 10;
	}
	camera.updateProjectionMatrix();
}


function onKeyDown(event) {
	if (event.keyCode === 37) {
		// left arrow
		lonFactor = -0.5;
	} else if (event.keyCode === 38) {
		// up arrow
		latFactor = 0.5;
	} else if (event.keyCode === 39) {
		// right arrow
		lonFactor = 0.5
	} else if (event.keyCode === 40) {
		// down arrow
		latFactor = -0.5;
	}
}


function onKeyUp(event) {
	lonFactor = 0;
	latFactor = 0;
	isUserInteracting = false;
}


function animate() {
	requestAnimationFrame(animate);
	update();
}

function update() {

	//console.log("camera position: " + vectorToString(camera.position));

	if (!isPopupOpen) {
		lon = lon + lonFactor;
		lat = lat + latFactor;
		lat = Math.max(-85, Math.min(85, lat));
		phi = THREE.Math.degToRad(90 - lat);
		theta = THREE.Math.degToRad(lon);
		camera.target.x = 200 * Math.sin(phi) * Math.cos(theta);
		camera.target.y = 200 * Math.cos(phi);
		camera.target.z = 200 * Math.sin(phi) * Math.sin(theta);
		camera.lookAt(camera.target);
		renderer.render( scene, camera );
	} else {
		composer.render();
	}
}

//------------------- helper functions------------------------------

// logging
function vectorToString(v) { return "[ " + v.x + ", " + v.y + ", " + v.z + " ]"; }


// shaders

function setupBlurShader() {
	composer = new THREE.EffectComposer(renderer);
	composer.addPass(new THREE.RenderPass(scene, camera));

	var blurShader = new THREE.ShaderPass( THREE.BlurShader );
	blurShader.uniforms[ "h" ].value = 1.0 / window.innerWidth;
	blurShader.uniforms[ "v" ].value = 1.0 / window.innerHeight;
	blurShader.renderToScreen = true;

	composer.addPass(blurShader);
}

