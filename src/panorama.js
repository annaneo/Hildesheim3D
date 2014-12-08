/** (c) */

var camera, scene, renderer;

var isUserInteracting = false;
var onMouseDownMouseX = 0;
var onMouseDownMouseY = 0;
var lon = 0;
var onMouseDownLon = 0;
var lat = 0;
var onMouseDownLat = 0;
var phi = 0;
var theta = 0;
var projector;
var mouse = { x: 0, y: 0 };
var targetList = [];

function startPanorama(panoImg) {
	init(panoImg);
	animate();
}


function removePanorama() {
	var container = document.getElementById('container');
	if (container.childNodes.length > 0) {
		container.removeChild(container.childNodes[0]);
	}
	targetList = [];
	mouse = { x: 0, y: 0 };
}


function init(panoImg) {

	removePanorama();

	scene = new THREE.Scene();

	var container = document.getElementById('container');

	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
	camera.target = new THREE.Vector3(0, 0, 0);

	// initialize object to perform world/screen calculations
	projector = new THREE.Projector();


	var nextPanoImg;										//TODO: clean up!
	if (panoImg === 'resources/panos/kirche025.jpg') {
		nextPanoImg = 'resources/panos/kirche027.jpg';
	} else if (panoImg === 'resources/panos/kirche027.jpg') {
		nextPanoImg = 'resources/panos/kirche029.jpg';
	} else {
		nextPanoImg = 'resources/panos/kirche025.jpg';
	}


	var place = new Place(panoImg);
	//TODO: commented line for demo
	//targetList.push(place.addInfoLabel(300, 1, 1, {panoImg: nextPanoImg}));

	scene.add(place);


	if (Detector.webgl) {
		renderer = new THREE.WebGLRenderer( {antialias:true} );
	} else {
		renderer = new THREE.CanvasRenderer();
	}

	renderer.setSize(window.innerWidth, window.innerHeight);
	container.appendChild(renderer.domElement);

	document.addEventListener('mousedown', onDocumentMouseDown, false);
	document.addEventListener('mousemove', onDocumentMouseMove, false);
	document.addEventListener('mouseup', onDocumentMouseUp, false);
	document.addEventListener('mousewheel', onDocumentMouseWheel, false);
	document.addEventListener('DOMMouseScroll', onDocumentMouseWheel, false);

	//

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

	//

	window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);

}

function onDocumentMouseDown(event) {

	onPointerDownPointerX = event.clientX;
	onPointerDownPointerY = event.clientY;

	onPointerDownLon = lon;
	onPointerDownLat = lat;


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
		console.log("Hit @ " + vectorToString( intersects[0].point ));
		intersects[0].object.onClick();

	} else {
		isUserInteracting = true;
	}

}

function onDocumentMouseMove(event) {

	if (isUserInteracting === true) {

		lon = ( onPointerDownPointerX - event.clientX ) * 0.1 + onPointerDownLon;
		lat = ( event.clientY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;

	}

}

function onDocumentMouseUp(event) {

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

function animate() {

	requestAnimationFrame(animate);
	update();

}

function update() {

	lat = Math.max(-85, Math.min(85, lat));
	phi = THREE.Math.degToRad(90 - lat);
	theta = THREE.Math.degToRad(lon);

	camera.target.x = 500 * Math.sin(phi) * Math.cos(theta);
	camera.target.y = 500 * Math.cos(phi);
	camera.target.z = 500 * Math.sin(phi) * Math.sin(theta);

	camera.lookAt(camera.target);

	renderer.render(scene, camera);

}


function vectorToString(v) { return "[ " + v.x + ", " + v.y + ", " + v.z + " ]"; }
