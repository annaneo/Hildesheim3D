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
var panoramaData;
var isLoading = false;

function startPanorama(panoImg) {
	init(panoImg);
	animate();
}


//TODO: use this instead of function above

/**
 * start panorama, creates a loading scene and triggers the loading of the start location. Starts animating.
 * @param dataURL URL to the config JSON
 */
function _startPanorama(dataURL) {
	_init();
	var loadingScene = new THREE.Scene();

	//------------- creat loading scene -------------------------
	var geometry = new THREE.Geometry();
	for (var i = 0; i < 20000; i ++ ) {

		var vertex = new THREE.Vector3();
		vertex.x = Math.random() * 2000 - 1000;
		vertex.y = Math.random() * 2000 - 1000;
		vertex.z = Math.random() * 2000 - 1000;

		geometry.vertices.push( vertex );

	}
	var parameters = [
		[ [1, 1, 0.5], 5 ],
		[ [0.95, 1, 0.5], 4 ],
		[ [0.90, 1, 0.5], 3 ],
		[ [0.85, 1, 0.5], 2 ],
		[ [0.80, 1, 0.5], 1 ]
	];
	var color, size, particles, materials = [];
	for ( i = 0; i < parameters.length; i ++ ) {

		color = parameters[i][0];
		size  = parameters[i][1];

		materials[i] = new THREE.PointCloudMaterial( { size: size } );

		particles = new THREE.PointCloud( geometry, materials[i] );

		particles.rotation.x = Math.random() * 6;
		particles.rotation.y = Math.random() * 6;
		particles.rotation.z = Math.random() * 6;

		loadingScene.add(particles);

	}
	//----------------- end loading scene --------------------------------

	scene = loadingScene;
	parseConfigJSON(dataURL, function (data) {
		var loader = new LocationLoader();
		loader.loadLocation(data.startLocation, _startComplete);
	});
	isLoading = true;
	animate();
}

/**
 * Loads and parses the config JSON file at given URL, when finished parsing it calls given callback.
 * @param dataURL URL to config JSON.
 * @param callback function that gets called after parsing is finished.
 */
function parseConfigJSON(dataURL, callback) {
	var request = new XMLHttpRequest();
	request.open("GET", dataURL, true);
	request.onreadystatechange = function() {
		if (request.readyState === 4 && request.status === 200) {
			panoramaData = JSON.parse(request.responseText);
			callback(panoramaData);
		}
	};
	request.send(null);
}


/**
 * Initializes renderer, camera, projector
 * (also event listeners, shader ?, shader needs a scene)
 */
function _init() {
	camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight ,1, 1000);
	camera.target = new THREE.Vector3(0, 0, 0);
	// initialize object to perform world/screen calculations
	projector = new THREE.Projector();
	if (Detector.webgl) {
		renderer = new THREE.WebGLRenderer( {antialias:true} );
	} else {
		renderer = new THREE.CanvasRenderer();
	}
	renderer.setSize(window.innerWidth, window.innerHeight);
	var container = $('panorama');
	container.appendChild(renderer.domElement);
}

function _startComplete(location) {
	var panoScene = new THREE.Scene();
	panoScene.add(location);
	scene = panoScene;
	updateTargetList();
	initEventListener();
	setupBlurShader();
	isLoading = false;
}

function updateTargetList() {
	targetList = [];
	scene.traverse(function (object) {
		if (object instanceof Hotspot || object instanceof Transition) {
			targetList.push(object);
			//TODO: setting object rotation should NOT be here!
			object.lookAt( camera.position );
		}
	});
}


function transitToLocation(locationIndex) {
	var loader = new LocationLoader();
	loader.loadLocation(locationIndex, function (location) {
		var panoScene = new THREE.Scene();
		panoScene.add(location);
		scene = panoScene;
		updateTargetList();
	});
}



function removePanorama() {
	var container = $('panorama');
	if (container.childNodes.length > 0) {
		container.removeChild(container.childNodes[0]);
	}
	targetList = [];
	mouse = { x: 0, y: 0 };
}


function init(panoImg) {
	removePanorama();
	var panoScene = new THREE.Scene();

	var container = $('panorama');

	camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight ,1, 1000);
	camera.target = new THREE.Vector3(0, 0, 0);

	// initialize object to perform world/screen calculations
	projector = new THREE.Projector();

	var location = new Location(panoImg);
	var hotspotParam = {position: new THREE.Vector3(150, 1, 1)};
	targetList.push(location.addHotspot(hotspotParam));

	panoScene.add(location);

	if (Detector.webgl) {
		renderer = new THREE.WebGLRenderer( {antialias:true} );
	} else {
		renderer = new THREE.CanvasRenderer();
	}
	renderer.setSize(window.innerWidth, window.innerHeight);
	container.appendChild(renderer.domElement);

	scene = panoScene;
	initEventListener();
	setupBlurShader();
}


function initEventListener() {
	var container = $('panorama');

	THREEx.FullScreen.bindKey({charCode : 'f'.charCodeAt(0) /*, element : $('panorama')*/});

	container.addEventListener('mousedown', onDocumentMouseDown, false);
	container.addEventListener('mousemove', onDocumentMouseMove, false);
	container.addEventListener('mouseup', onDocumentMouseUp, false);
	container.addEventListener('mousewheel', onDocumentMouseWheel, false);
	container.addEventListener('DOMMouseScroll', onDocumentMouseWheel, false);
	container.addEventListener('dragover', function (event) {
		event.preventDefault();
		event.dataTransfer.dropEffect = 'copy';
	}, false);
	container.addEventListener('dragenter', function (event) {
		document.body.style.opacity = 0.5;
	}, false);
	container.addEventListener('dragleave', function (event) {
		document.body.style.opacity = 1;
	}, false);
	container.addEventListener('drop', function (event) {
		event.preventDefault();
		var reader = new FileReader();
		reader.addEventListener('load', function (event) {
			material.map.image.src = event.target.result;
			material.map.needsUpdate = true;

		}, false);
		reader.readAsDataURL(event.dataTransfer.files[0]);
		document.body.style.opacity = 1;
	}, false);
	container.addEventListener('keydown', onKeyDown, false);
	container.addEventListener('keyup', onKeyUp, false);

	window.addEventListener('resize', onWindowResize, false);

	$('infoCloseButton').addEventListener('click', function (event) {
		var div = $("infoView");
		div.style.display = "none";
		isPopupOpen = false;
	}, false);
    $('map').addEventListener('dragstart', function(event) { event.preventDefault(); });
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
		if (intersects[0].object instanceof Hotspot) {
			isPopupOpen = true;
		}
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
	if (isLoading) {
		var time = Date.now() * 0.00005;
		for (var i = 0; i < scene.children.length; i ++) {
			var object = scene.children[i];
			if (object instanceof THREE.PointCloud) {
				object.rotation.y = time * ( i < 4 ? i + 1 : - ( i + 1 ) );
			}
		}
		renderer.render(scene, camera);
		return;
	}

	if (!isPopupOpen) {
		lon = lon + lonFactor;
		lat = lat + latFactor;
		lat = Math.max(-35, Math.min(45, lat));
		phi = THREE.Math.degToRad(90 - lat);
		theta = THREE.Math.degToRad(lon);
		camera.target.x = 200 * Math.sin(phi) * Math.cos(theta);
		camera.target.y = 200 * Math.cos(phi);
		camera.target.z = 200 * Math.sin(phi) * Math.sin(theta);
		camera.lookAt(camera.target);
		renderer.render(scene, camera);
	} else {
		composer.render();
	}
}

//------------------- helper functions------------------------------

/**
 * Helper for getting dom element via id
 * @param id id of dom element
 * @returns {HTMLElement} dom element
 */
function $(id) {
	return document.getElementById(id);
}

/**
 * Helper for pretty print vectors
 * @param v 3d vector to print
 * @returns {string} vector as string in form [x, y, z]
 */
function vectorToString(v) { return "[ " + v.x + ", " + v.y + ", " + v.z + " ]"; }


/**
 * Sets up blur shader.
 */
function setupBlurShader() {
	composer = new THREE.EffectComposer(renderer);
	var renderPass = new THREE.RenderPass(scene, camera);
	composer.addPass(renderPass);

	var blurShader = new THREE.ShaderPass( THREE.BlurShader );
	blurShader.uniforms[ "h" ].value = 1.0 / window.innerWidth;
	blurShader.uniforms[ "v" ].value = 1.0 / window.innerHeight;
	blurShader.renderToScreen = true;

	composer.addPass(blurShader);
}

