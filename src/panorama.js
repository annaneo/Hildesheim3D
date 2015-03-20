/**
 * (C)  Julius Peinelt
 *      Anna Neovesky
 */

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
var transitionComposer;
var panoramaData;
var isLoading = false;
var lastPanoramaUID = -1;
var mapUid = 0;

var toolTip;

var timerId;

/**
 * start panorama, creates a loading scene and triggers the loading of the start location. Starts animating.
 * @param dataURL URL to the config JSON
 */
function startPanorama(dataURL) {
    setMapandNavigationHidden(true);
	init();
    isLoading = true;
	parseConfigJSON(dataURL, function (data) {
		var loader = new LocationLoader();
		loader.loadLocation(data.startLocation, startComplete);
	});
	animate();
}


/**
 * initalize Tooltip for hotspots and transitions
 * //TODO: ToolTip also for mapSpots
 */
function initTooltip() {
    toolTip = _('toolTip');
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
function init() {
	camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 200);
	camera.target = new THREE.Vector3(0, 0, 1);
	// initialize object to perform world/screen calculations
	projector = new THREE.Projector();
	if (Detector.webgl) {
		renderer = new THREE.WebGLRenderer( {antialias:true} );
	} else {
		renderer = new THREE.CanvasRenderer();
	}
	renderer.setSize(window.innerWidth, window.innerHeight);
	var container = _('panorama');
	container.appendChild(renderer.domElement);
    initTooltip()
}

/**
 *
 * @param location that will be rendered
 */
function startComplete(location) {
	var panoScene = new THREE.Scene();
	panoScene.add(location);
	scene = panoScene;
    var cts = location.cameraTargets;
    lat = cts[-1].lat;
    lon = cts[-1].lon;
    lastPanoramaUID = location.uid;
    mapUid = location.mapUid;
    updateSceneSwitchButton();
	updateTargetList();
	initEventListener();
	setupDarkBlurShader();
    setupBrightBlurShader();
	isLoading = false;
    setMapandNavigationHidden(false);
}


/**
 * Updates the Array of clickable objects in the scene.
 */
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


/**
 * Transit to given location
 * @param locationIndex index of location
 */
function transitToLocation(locationIndex, reset) {
    if (reset) {
        lastPanoramaUID = -1; //update lastPanoramaUID to current location.uid for transition
    }
    isLoading = true;

    setMapandNavigationHidden(true);

    setTimeout(function () {    // Hack
        var loader = new LocationLoader();
        loader.loadLocation(locationIndex, function (location) {
            var panoScene = new THREE.Scene();
            panoScene.add(location);
            scene = panoScene;
            var cts = location.cameraTargets;
            if (cts[lastPanoramaUID]) {
                lat = cts[lastPanoramaUID].lat;
                lon = cts[lastPanoramaUID].lon;
            } else if (cts[-1]) {
                lat = cts[-1].lat;
                lon = cts[-1].lon;
            } else {
                lat = 2;
                lon = -103;
            }
            lastPanoramaUID = location.uid;
            mapUid = location.mapUid;
            updateSceneSwitchButton();
            updateTargetList();
            setupDarkBlurShader();
            setupBrightBlurShader();
            isLoading = false;
            setMapandNavigationHidden(false);
            camera.fov = 60;
            camera.updateProjectionMatrix();
        });
    }, 50);
}

/**
 * adds EventListeners to scene
 */
function initEventListener() {
	var container = _('panorama');
	THREEx.FullScreen.bindKey({charCode : 'f'.charCodeAt(0) /*, element : _('panorama')*/});

	container.addEventListener('mousedown', onMouseDown, false);
	container.addEventListener('mousemove', onMouseMove, false);
	container.addEventListener('mouseup', onMouseUp, false);
	container.addEventListener('mousewheel', onMouseWheel, false);
	container.addEventListener('DOMMouseScroll', onMouseWheel, false);

    container.addEventListener('touchstart', onDocumentTouchStart, false);
    container.addEventListener('touchmove', onDocumentTouchMove, false);
    container.addEventListener('touchend', onDocumentTouchEnd, false );


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
	document.addEventListener('keydown', onKeyDown, false);
	document.addEventListener('keyup', onKeyUp, false);

	window.addEventListener('resize', onWindowResize, false);

	_('infoCloseButton').addEventListener('click', function (event) {
        var audioControls = _('audioControls');
        audioControls.pause();
		var div = _("infoView");
		div.style.display = "none";
		isPopupOpen = false;
        setMapandNavigationHidden(false);
	}, false);
    _('infoCloseButton').addEventListener('touched', function (event) {
        var audioControls = _('audioControls');
        audioControls.pause();
        var div = _("infoView");
        div.style.display = "none";
        isPopupOpen = false;
        setMapandNavigationHidden(false);
    }, false);
    _('map').addEventListener('dragstart', function(event) { event.preventDefault(); });

    _('upNavButton').addEventListener('mousedown', function(event) {
        isUserInteracting = true;
        latFactor = 0.5;
    }, false);
    _('downNavButton').addEventListener('mousedown', function(event) {
        isUserInteracting = true;
        latFactor = -0.5;
    }, false);
    _('leftNavButton').addEventListener('mousedown', function(event) {
        isUserInteracting = true;
        lonFactor = -0.5;
    }, false);
    _('rightNavButton').addEventListener('mousedown', function(event) {
        isUserInteracting = true;
        lonFactor = 0.5;
    }, false);
    _('zoomInButton').addEventListener('mousedown', function(event) {
        zoom(-2)
    }, false);
    _('zoomOutButton').addEventListener('mousedown', function(event) {
        zoom(2)
    }, false);
    _('navigationButtonsContainer').addEventListener('mouseup', onMouseUp, false);

    _('upNavButton').addEventListener('touchstart', function(event) {
        isUserInteracting = true;
        latFactor = 0.5;
    }, false);
    _('downNavButton').addEventListener('touchstart', function(event) {
        isUserInteracting = true;
        latFactor = -0.5;
    }, false);
    _('leftNavButton').addEventListener('touchstart', function(event) {
        isUserInteracting = true;
        lonFactor = -0.5;
    }, false);
    _('rightNavButton').addEventListener('touchstart', function(event) {
        isUserInteracting = true;
        lonFactor = 0.5;
    }, false);
    _('zoomInButton').addEventListener('touchstart', function(event) {
        zoom(-2)
    }, false);
    _('zoomOutButton').addEventListener('touchstart', function(event) {
        zoom(2)
    }, false);
    _('navigationButtonsContainer').addEventListener('touchend', onMouseUp, false);

    _('about').addEventListener('touchstart', showAbout, false);
    _('about').addEventListener('mousedown', showAbout, false);
    _('aboutCloseButton').addEventListener('click', function (event) {
        var aboutView = _("aboutView");
        aboutView.style.display = "none";
        isPopupOpen = false;
        setMapandNavigationHidden(false);
    }, false);
    _('aboutCloseButton').addEventListener('touched', function (event) {
        var aboutView = _("aboutView");
        aboutView.style.display = "none";
        isPopupOpen = false;
        setMapandNavigationHidden(false);
    }, false);
    _('sceneSwitch').addEventListener('mousedown', switchScene);
    _('sceneSwitch').addEventListener('touchstart', switchScene);

}

function switchScene(event) {
    if (mapUid === 1) {
        transitToLocation(98, true);
    } else {
        transitToLocation(12, true);
    }
}


function updateSceneSwitchButton() {
    var button = _('sceneSwitch');
    if (mapUid === 1) {
        button.innerText = 'Zur Krypta';
    } else {
        button.innerText = 'Zum Kirchenraum';
    }
}

function setMapandNavigationHidden(hidden) {
    var map = _('map');
    var navButtons = _('navigationButtonsContainer');
    var about = _('about');
    var sceneSwitch = _('sceneSwitch');
    if (hidden) {
        map.style.display = 'none';
        navButtons.style.display = 'none';
        about.style.display = 'none';
        sceneSwitch.style.display = 'none';
    } else {
        map.style.display = 'block';
        navButtons.style.display = 'block';
        about.style.display = 'block';
        sceneSwitch.style.display = 'block';
    }

}

/**
 * //TODO: muss das hier nicht auch ein event sein?
 */
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * EvenListener if mouse is pressed
 * @param event
 */
function onMouseDown(event) {
    var eventX = event.pageX;
    var eventY = event.pageY;
    console.log('eventX: ' + eventX + '    eventY: ' + eventY);
    downEventHandler(eventX, eventY, event);
}

/**
 * EventListener if mouse is moving
 * @param event
 */
function onMouseMove(event) {
    var eventX = event.pageX;
    var eventY = event.pageY;
    //console.log('eventX: ' + eventX + '    eventY: ' + eventY);
    moveEventHandler(eventX, eventY, event);
}

/**
 * EventListener if mouse is up
 * @param event
 */
function onMouseUp(event) {
    upEventHandler(event);
}

/**
 * EventListener if mouse wheel is used
 * @param event
 */
function onMouseWheel(event) {
    wheelEventHandler(event.pageX, event.pageY, event);
}

/**
 *
 * @param event
 */
function onDocumentTouchStart(event) {
    if (event.touches.length === 1) {
        var touchX = event.touches[0].pageX;
        var touchY = event.touches[0].pageY;
        //console.log("touch x: " + touchX + "   touch y: " + touchY);
        downEventHandler(touchX, touchY, event);
    } else if (event.touches.length === 2) {
        //TODO: zoom in and out
    }
}

/**
 *
 * @param event
 */
function onDocumentTouchMove(event) {
    if (event.touches.length === 1) {
        var touchX = event.touches[0].pageX;
        var touchY = event.touches[0].pageY;
        //console.log("touch x: " + touchX + "   touch y: " + touchY);
        moveEventHandler(touchX, touchY, event);
    }
}

/**
 *
 * @param event
 */
function onDocumentTouchEnd(event) {
    upEventHandler(event);
}
/**
 *
 * @param eventX
 * @param eventY
 * @param event
 */

function moveEventHandler(eventX, eventY, event) {
    // Position of toolTips
    toolTip.style.left = eventX + 20 + "px";
    toolTip.style.top = eventY + 20 + "px";

    if (isPopupOpen) {
        return;
    }

    //mouse.x = ( ( eventX - renderer.domElement.offsetLeft ) / renderer.domElement.width ) * 2 - 1;
    //mouse.y = - ( ( eventY - renderer.domElement.offsetTop ) / renderer.domElement.height ) * 2 + 1;
    mouse.x = ( eventX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( eventY / window.innerHeight ) * 2 + 1;

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
        if (intersects.length > 0) {
            if (intersects[0].object != hoverIntersected) {
                if (hoverIntersected) {
                    hoverIntersected.material.color.setHex(hoverIntersected.currentHex);
                }
                hoverIntersected = intersects[0].object;
                // store color of closest object (for later restoration)
                hoverIntersected.currentHex = hoverIntersected.material.color.getHex();
                // set a new color for closest object
                hoverIntersected.material.color.setHex(0x917d4d);

                // Tooltip
                if (intersects[0].object.tooltip) {
                    toolTip.innerHTML = intersects[0].object.tooltip;
                    toolTip.style.display = "block";
                } else {
                    toolTip.innerHTML = "";
                    toolTip.style.display = "none";
                }

            }
        } else {
            if (hoverIntersected) {
                hoverIntersected.material.color.setHex(hoverIntersected.currentHex);
            }
            hoverIntersected = null;
            toolTip.style.display = "none";
        }
    }
}

/**
 *
 * @param eventX
 * @param eventY
 * @param event
 */
function downEventHandler(eventX, eventY, event) {
    if (isPopupOpen) {
        return;
    }
    event.preventDefault();

    // update the mouse variable
    // canvas position has to be 'static'
    //mouse.x = ( ( eventX - renderer.domElement.offsetLeft ) / renderer.domElement.width ) * 2 - 1;
    //mouse.y = - ( ( eventY - renderer.domElement.offsetTop ) / renderer.domElement.height ) * 2 + 1;
    mouse.x = ( eventX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( eventY / window.innerHeight ) * 2 + 1;

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
    toolTip.style.display = "none";
}

/**
 *
 * @param event
 */
function upEventHandler(event) {
    lonFactor = 0;
    latFactor = 0;
    isUserInteracting = false;
}

/**
 *
 * @param eventX
 * @param eventY
 * @param event
 */
//TODO: make ready for touch events
function wheelEventHandler(eventX, eventY, event) {
    event.preventDefault();
    if (isPopupOpen) {
        return;
    }

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

    if (camera.fov > 60) {
        camera.fov = 60;
    } else if (camera.fov < 40) {
        camera.fov = 40;
    }
    camera.updateProjectionMatrix();
}

function zoom(amount) {
    camera.fov += amount;
    if (camera.fov > 60) {
        camera.fov = 60;
    } else if (camera.fov < 40) {
        camera.fov = 40;
    }
    camera.updateProjectionMatrix();
}

/**
 * EventListener if & which key is dpown => for Key Navigation
 * @param event
 */
function onKeyDown(event) {
    isUserInteracting = true;
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

/**
 * Eventlistener if key is up => no navigation via keys.
 * @param event
 */
function onKeyUp(event) {
	lonFactor = 0;
	latFactor = 0;
	isUserInteracting = false;
}


/**
 *
 * @param elem
 * @param cursorStyle
 */
function updateCursor(elem, cursorStyle) {
    elem.style.cursor = cursorStyle;
}


/**
 * Shows about box.
 * @param event mouse/touch event
 */
function showAbout(event) {
    var aboutBox = document.getElementById('aboutView');
    aboutBox.style.display = "block";
    isPopupOpen = true;
}


/**
 * Update for new frame from Browser.
 */
function animate() {
	requestAnimationFrame(animate);
	update();
}

/**
 * Redraw the scene with new calculated camera target, blur, ...
 */
function update() {
    if (!scene) {
        return;
    }
    if (!isUserInteracting && !timerId) {
        timerId = setTimeout(resetPanorama, 2 * 60 * 1000);
    } else if (isUserInteracting && timerId) {
        clearTimeout(timerId);
        timerId = null;
    }

	if (isLoading) {
        if (transitionComposer) {
            transitionComposer.render();
        }
		return;
	}
// if popUp is open
	if (!isPopupOpen) {
		lon = (lon + lonFactor) % 360;
		lat = lat + latFactor;
        //console.log("lon: " + lon + "     lat: " + lat);

		lat = Math.max(-35, Math.min(45, lat));
		phi = THREE.Math.degToRad(90 - lat);
		theta = THREE.Math.degToRad(lon);
		camera.target.x = 195 * Math.sin(phi) * Math.cos(theta);
		camera.target.y = 195 * Math.cos(phi);
		camera.target.z = 195 * Math.sin(phi) * Math.sin(theta);
        camera.lookAt(camera.target);
        //console.log("Camera Target: " + vectorToString(camera.target));
        //console.log("-----------------------------");
		renderer.render(scene, camera);
	} else {
        setMapandNavigationHidden(true);
		composer.render();
	}
}

/**
 * Resets Panorama to start location.
 */
function resetPanorama() {
    lastPanoramaUID = -1;
    transitToLocation(panoramaData.startLocation, true);
}

//------------------- helper functions------------------------------

/**
 * Helper for getting dom element via id
 * @param id id of dom element
 * @returns {HTMLElement} dom element
 */
function _(id) {
	return document.getElementById(id);
}

/**
 * Helper for pretty print vectors
 * @param v 3d vector to print
 * @returns {string} vector as string in form [x, y, z]
 */
function vectorToString(v) { return "[ " + v.x + ", " + v.y + ", " + v.z + " ]"; }


/**
 * Sets up dark blur shader for hotspots.
 */
function setupDarkBlurShader() {
	composer = new THREE.EffectComposer(renderer);
	var renderPass = new THREE.RenderPass(scene, camera);
	composer.addPass(renderPass);

	var blurShader = new THREE.ShaderPass( THREE.BlurShader );
	blurShader.uniforms[ "h" ].value = 1.0 / window.innerWidth;
	blurShader.uniforms[ "v" ].value = 1.0 / window.innerHeight;
    blurShader.uniforms[ "strength"].value = 0.2;
	blurShader.renderToScreen = true;

	composer.addPass(blurShader);
}

/**
 * Sets up bright blur shader for transitions.
 */
function setupBrightBlurShader() {
    transitionComposer = new THREE.EffectComposer(renderer);
    var renderPass = new THREE.RenderPass(scene, camera);
    transitionComposer.addPass(renderPass);

    var blurShader = new THREE.ShaderPass( THREE.BlurShader );
    blurShader.uniforms[ "h" ].value = 1.0 / window.innerWidth;
    blurShader.uniforms[ "v" ].value = 1.0 / window.innerHeight;
    blurShader.uniforms[ "strength"].value = 0.5;
    blurShader.renderToScreen = true;

    transitionComposer.addPass(blurShader);
}

