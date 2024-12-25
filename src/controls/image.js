import * as THREE from "three";

import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// let camera, scene, renderer;

// let object;

// init();

// function init() {
//   camera = new THREE.PerspectiveCamera(
//     45,
//     window.innerWidth / window.innerHeight,
//     0.1,
//     50
//   );
//   camera.position.z = 2.5;

//   scene = new THREE.Scene();

//   const ambientLight = new THREE.AmbientLight(0xffffff);
//   scene.add(ambientLight);

//   const pointLight = new THREE.PointLight(0xffffff, 15);
//   camera.add(pointLight);
//   scene.add(camera);

//   // manager

//   const manager = new THREE.LoadingManager(loadModel);

//   const textureLoader = new THREE.TextureLoader(manager);
//   const texture = textureLoader.load("./icm.png", render);

//   function loadModel() {
//     object.traverse(function (child) {
//       if (child.isMesh) {
//         child.material.map = texture;
//         child.material.needsUpdate = true;
//         child.material.opacity = 1;
//         // child.material.map.repeat.set(10, 10);
//       }
//     });

//     object.position.y = -0.95;
//     object.scale.setScalar(0.01);
//     scene.add(object);

//     render();
//   }

//   // texture

//   // model

//   function onProgress(xhr) {
//     if (xhr.lengthComputable) {
//       const percentComplete = (xhr.loaded / xhr.total) * 100;
//       console.log("model " + percentComplete.toFixed(2) + "% downloaded");
//     }
//   }

//   function onError() {}

//   const loader = new OBJLoader(manager);
//   loader.load(
//     "./mesh/t_shirt.obj",
//     function (obj) {
//       object = obj;
//     },
//     onProgress,
//     onError
//   );

//   //

//   renderer = new THREE.WebGLRenderer({ antialias: true });
//   renderer.setPixelRatio(window.devicePixelRatio);
//   renderer.setSize(window.innerWidth, window.innerHeight);
//   document.getElementById("container").appendChild(renderer.domElement);

//   //

//   const controls = new OrbitControls(camera, renderer.domElement);
//   controls.minDistance = 2;
//   controls.maxDistance = 5;
//   controls.addEventListener("change", render);

//   //

//   window.addEventListener("resize", onWindowResize);
// }

// function onWindowResize() {
//   camera.aspect = window.innerWidth / window.innerHeight;
//   camera.updateProjectionMatrix();

//   renderer.setSize(window.innerWidth, window.innerHeight);
// }

// function render() {
//   function animate() {
//     requestAnimationFrame(animate);
//     renderer.render(scene, camera);
//   }

//   animate();
//   //   renderer.render(scene, camera);
// }
var container;
var containerBox = {
  x: 442,
  y: 104,
  width: 1354,
  height: 1028,
  top: 104,
  right: 1796,
  bottom: 1132,
  left: 442,
};
var defaultScale = 1;
var object;
var renderer, scene, camera, stats;
var mesh = [];
var currentMeshUrl = "";
var currentNormalUrl = "";

var textureURL;
var currentLogo;

var currentProduct = {
  Id: 1922,
  Name: "Regna Art Tri Suit",
  TypeName: "",
  Thumbnail: "/media/xkdpzeah/screenshot186a.png?width=120px\u0026height=120px",
  Texture: [
    "/media/lnqneo5v/woman_suit01_out_diffuse_v03.png?width=100px",
    "/media/lnqneo5v/woman_suit01_out_diffuse_v03.png?width=2048px",
  ],
  Mesh: "/media/lh3l32w4/trisuit_art_woman.obj",
  Description: "Regna Art Tri Suit",
  ShortDescription: "",
  Price: "0",
  TextureNormal: "/media/ftlbnufl/woman_suit01_out_normal.png",
  Styles: null,
  PartOpacities: null,
};
var opacityLogo = 0.8;
var raycaster;
var line;
var decalMesh;
var material;
var controls;
var light;
var materialShininess = 25;
var lightPower = 0.45;
var currentLink = "";
var canChangeColor;
var intersection = {
  intersects: false,
  point: new THREE.Vector3(),
  normal: new THREE.Vector3(),
};
var mouse = new THREE.Vector2();
var textureLoader = new THREE.TextureLoader();

var texture; // = textureLoader.load('model/texture/default.jpg');

var toolbarActive = "logo";

var decals = [];
var mouseHelper;
var position = new THREE.Vector3();
var orientationMouse = new THREE.Euler();
var size = new THREE.Vector3(10, 10, 10);

var moved = false;
var draged = false;
var ctrlPressed = false;
window.updateTheLogo = [];
window.logoSelectionChanged = [];

window.addEventListener("load", init);

function updateLogoSelectionChanged(logo) {
  for (let i = 0; i < window.logoSelectionChanged.length; i++) {
    if (window.logoSelectionChanged[i](logo) === true) {
      return;
    }
  }
}

function setIntervalX(callback, delay, repetitions) {
  var x = 0;
  var intervalID = window.setInterval(function () {
    callback();

    if (++x === repetitions) {
      window.clearInterval(intervalID);
    }
  }, delay);
}

function unHightLight() {
  if (intersection.mesh != null) {
    if (intersection.mesh.material.emissive.r == 0) {
      intersection.mesh.material.emissive.setRGB(0.25, 0.25, 0.25);
    } else {
      intersection.mesh.material.emissive.setRGB(0, 0, 0);
    }
  }
}

function blinkDecals() {
  if (currentLogo != null) {
    if (currentLogo.decalMesh.material.emissive.r === 0) {
      currentLogo.decalMesh.material.setRGB(0.25, 0.25, 0.25);
    } else {
      currentLogo.decalMesh.material.emissive.setRGB(0, 0, 0);
    }
  }
}

var decalHighLight = null;
function resetDecalHighLight() {
  if (decalHighLight != null) {
    decalHighLight.material.emissive.setRGB(0.0, 0.0, 0.0);
    decalHighLight = null;
  }
}

function highLightDecals(event) {
  getMousePos(event);
  raycaster.setFromCamera(mouse, camera);
  var intersects = raycaster.intersectObjects(decals);

  if (intersects.length > 0) {
    resetDecalHighLight();
    decalHighLight = intersects[intersects.length - 1].object.logo.decalMesh;
    decalHighLight.material.emissive.setRGB(0.25, 0.25, 0.25);
  } else {
    resetDecalHighLight();
  }
}

function checkIntersection() {
  if (!object) return;
  raycaster.setFromCamera(mouse, camera);

  var intersects = raycaster.intersectObjects([object], true);

  if (intersects.length > 0) {
    var p = intersects[0].point;
    mouseHelper.position.copy(p);
    intersection.point.copy(p);
    var n = intersects[0].face.normal.clone();
    n.transformDirection(intersects[0].object.matrixWorld);
    n.multiplyScalar(10);
    n.add(intersects[0].point);

    intersection.normal.copy(intersects[0].face.normal);
    mouseHelper.lookAt(n);

    if (canChangeColor) {
      if (intersection.mesh != null) {
        intersection.mesh.material.emissive.setRGB(0, 0, 0);
      }
      intersection.mesh = intersects[0].object;
      intersection.mesh.material.emissive.setRGB(0.25, 0.25, 0.25);
      setIntervalX(unHightLight, 100, 5);
    } else {
      intersection.mesh = intersects[0].object;
      intersection.intersects = true;
    }
  } else {
    intersection.intersects = false;
  }
}

function getCanvasRelativePosition(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) * renderer.domElement.width) / rect.width,
    y: ((event.clientY - rect.top) * renderer.domElement.height) / rect.height,
  };
}

function getMousePos(event) {
  const pos = getCanvasRelativePosition(event);
  mouse.x = (pos.x / renderer.domElement.width) * 2 - 1;
  mouse.y = -(pos.y / renderer.domElement.height) * 2 + 1;
  //checkIntersection();
}

function clearPickPosition() {
  // unlike the mouse which always has a position
  // if the user stops touching the screen we want
  // to stop picking. For now we just pick a value
  // unlikely to pick something
  mouse.x = -100000;
  mouse.y = -100000;
}

function updateCurrent() {
  if (
    currentLogo != null &&
    currentLogo.IsPattern == true &&
    intersection.mesh != null
  ) {
    patternHandling.updatePattern(currentLogo, intersection);
  } else if (
    currentLogo != null &&
    currentLogo.IsText == true &&
    intersection.mesh != null
  ) {
    insertTextOnModel(currentLogo, intersection);
    // shoot(true);
  } else {
    insertLogoOnModel();
  }
}
function mouseMove(event) {
  moved = true;
  /*
    if(draged && event.altKey)
    {
        resetDecalHighLight();
        if(currentLogo != null)
        {
            currentLogo.Rotate -=event.movementY/10;
            updateLogoChange(currentLogo);
        }
        return;
    }*/
  if (draged) {
    resetDecalHighLight();
    getMousePos(event);
    checkIntersection();
    updateCurrent();
  } else {
    highLightDecals(event);
  }
}

function mouseDown(event) {
  console.log("event", event);
  moved = false;
  draged = false;
  if (toolbarActive == "logo") {
    getMousePos(event);
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(decals);

    if (intersects.length > 0) {
      currentLogo = intersects[0].object.logo;

      updateLogoSelectionChanged(currentLogo);
      draged = true;
      controls.enableRotate = false;
    } else {
      if (currentLogo?.Position == null) {
        drop(event);
      }
      currentLogo = null;
    }
  } else if (toolbarActive == "text") {
    getMousePos(event);
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(texts);

    if (intersects.length > 0) {
      currentLogo = intersects[0].object.logo;

      window.selectTextDecals(currentLogo);
      draged = true;
      controls.enableRotate = false;
    } else {
      if (currentLogo.Position == null) {
        drop(event);
      }
      currentLogo = null;
    }
  }
}

function mouseUp(event) {
  getMousePos(event);
  draged = false;
  controls.enableRotate = true;
  checkIntersection();

  if (!moved && intersection.intersects) {
    updateCurrent();
  }
}

function onContainerResize() {
  console.log("onContainerResize");
  //   containerBox = container.getBoundingClientRect();

  renderer.setSize(containerBox.width, containerBox.height);

  camera.aspect = containerBox.width / containerBox.height;
  camera.updateProjectionMatrix();
  // optional animate/renderloop call put here for render-on-changes
}

function mouseWheel(evt) {
  if (evt.altKey && currentLogo != null) {
    controls.enableZoom = false;
    evt.preventDefault();
    currentLogo.Scale += evt.wheelDelta / 100;
    updateLogoChange(currentLogo);
    //console.log(currentLogo.Scale);
  } else {
    controls.enableZoom = true;
  }
}

function init() {
  console.log("init");
  container = document.getElementById("container");
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  //renderer.setSize(window.innerWidth, window.innerHeight);
  //   containerBox = container.getBoundingClientRect();
  renderer.setSize(containerBox.width, containerBox.height);

  renderer.setClearColor(0xffffff, 0);
  container.appendChild(renderer.domElement);
  container.addEventListener("resize", onContainerResize);
  //stats = new Stats();
  //container.appendChild( stats.dom );

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    45,
    containerBox.width / containerBox.height,
    1,
    1000
  );
  camera.position.z = 120;
  camera.target = new THREE.Vector3();

  controls = new OrbitControls(camera, renderer.domElement);
  //   controls.enableDamping = true;
  //   controls.dampingFactor = 0.05;
  //   controls.rotateSpeed = 0.05;
  //   controls.enableKeys = false;
  //   controls.enablePan = false;
  controls.minDistance = 10;
  controls.maxDistance = 300;

  controls.addEventListener("change", light_update);

  scene.add(new THREE.AmbientLight(0xffffff, lightPower));

  light = new THREE.PointLight(0xffffff, lightPower);
  light.position.set(0, 0, 0);
  scene.add(light);

  var geometry = new THREE.BufferGeometry();
  geometry.setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);

  line = new THREE.Line(geometry, new THREE.LineBasicMaterial());
  scene.add(line);

  raycaster = new THREE.Raycaster();

  mouseHelper = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 10),
    new THREE.MeshNormalMaterial()
  );
  mouseHelper.visible = false;
  scene.add(mouseHelper);

  window.addEventListener("resize", onContainerResize, false);
  window.addEventListener("keydown", (event) => {
    if (event.key === "Delete" && currentLogo !== null) {
      if (currentLogo.Position !== undefined && currentLogo.Position != null) {
        $("#deleteDialog").modal({ show: true });
      }
      return;
    }
    // do something
  });

  renderer.domElement.addEventListener("wheel", mouseWheel);

  renderer.domElement.addEventListener("mousemove", mouseMove, false);
  renderer.domElement.addEventListener(
    "touchmove",
    (event) => {
      mouseMove(event.touches[0]);
    },
    false
  );

  renderer.domElement.addEventListener("mousedown", mouseDown, false);
  renderer.domElement.addEventListener(
    "touchstart",
    (event) => {
      // prevent the window from scrolling
      event.preventDefault();
      mouseDown(event.touches[0]);
    },
    false
  );

  renderer.domElement.addEventListener("mouseup", mouseUp, false);
  renderer.domElement.addEventListener(
    "touchend",
    (event) => {
      mouseUp(event.changedTouches[0]);
    },
    false
  );

  onContainerResize();
  //onWindowResize();
  animate();

  if (currentProduct != null) {
    loadObj();
  }
}

function clearAllLogo() {
  decals.forEach(function (d) {
    scene.remove(d.logo.decalMesh);
    d.logo.Position = null;
    d.logo.Orientation = null;
  });
  decals = [];
}

function updateLogoOnTab() {
  for (let i = 0; i < window.updateTheLogo.length; i++) {
    if (window.updateTheLogo[i](currentLogo) === true) return;
  }
}
function deleteCurrentLogo() {
  currentLogo.Position = null;
  currentLogo.Orientation = null;
  deleteLogo(currentLogo);
  updateLogoOnTab();
}

function deleteLogo(logo) {
  scene.remove(logo.decalMesh);
  var temp = [];

  decals.forEach(function (d) {
    if (d.logo.Id !== logo.Id) {
      temp.push(d);
    }
  });
  decals = temp;
}

function clearLogo(logo) {
  scene.remove(logo.decalMesh);
  var temp = [];

  decals.forEach(function (d) {
    if (d.logo.Id !== logo.Id) {
      temp.push(d);
    } else {
      d.logo.Position = null;
      d.logo.Orientation = null;
    }
  });
  decals = temp;
}

function updateLogoChange(logo) {
  console.log("update change " + logo);
  currentLogo = logo;
  scene.remove(currentLogo.decalMesh);
  let orientationTemp = new THREE.Euler();
  orientationTemp.copy(currentLogo.Orientation);
  orientationTemp.z += (currentLogo.Rotate * Math.PI) / 180;

  var scale = currentLogo.Scale; //params.scale;//params.minScale + Math.random() * ( params.maxScale - params.minScale );
  size.set(scale * defaultScale, scale * defaultScale, scale * defaultScale);

  var material = currentLogo.decalMaterial; //.clone();
  //material.color.setHex( Math.random() * 0xffffff );

  currentLogo.decalMesh = new THREE.Mesh(
    new THREE.DecalGeometry(
      intersection.mesh,
      currentLogo.Position,
      orientationTemp,
      size
    ),
    material
  );
  currentLogo.decalMesh.logo = currentLogo;
  //currentLogo.meshID = intersection.meshID;
  if (currentLogo.IsPattern === false) {
    currentLogo.decalMesh.renderOrder = 1;
  }
  scene.add(currentLogo.decalMesh);

  var temp = [];
  decals.forEach(function (d) {
    if (d.logo.Id !== currentLogo.Id) {
      temp.push(d);
    } else {
      temp.push(currentLogo.decalMesh);
    }
  });
  //decals=[];
  decals = temp;
}

function updateLogoSelect(logo) {
  currentLogo = logo;
  if (currentLogo == null) return;
  if (!currentLogo.decalMaterial) {
    var decalDiffuse = textureLoader.load(currentLogo.Thumbnail);
    decalDiffuse.minFilter = THREE.LinearFilter;

    currentLogo.decalMaterial = new THREE.MeshPhongMaterial({
      specular: 0x444444,
      map: decalDiffuse,
      normalScale: new THREE.Vector2(1, 1),
      shininess: 50,
      transparent: true,
      opacity: opacityLogo,
      depthTest: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      wireframe: false,
    });
  }
}

function fitCameraToObject(camera, object, offset, controls) {
  offset = offset || 1.25;
  //   const boundingBox = new THREE.Box3();

  // get bounding box of object - this will be used to setup controls and camera
  //   boundingBox.setFromObject(object);

  //ERRORS HERE
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  console.log("center", center);
  object.position.sub(center);
  const size = box.getSize();
  console.log("size", size);
  // get the max side of the bounding box (fits to width OR height as needed )
  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = 60 * (Math.PI / 180);
  let cameraZ = Math.abs(maxDim / (2 * Math.tan(fov / 2))); //Applied fifonik correction

  cameraZ *= offset; // zoom out a little so that objects don't fill the screen
  defaultScale = maxDim / 20;

  camera.position.set(center.x, center.y, center.z + cameraZ); //Multiply unit vector times cameraZ distance
  camera.lookAt(center); //Look at object

  if (controls) {
    controls.minDistance = maxDim / 2;
    controls.maxDistance = maxDim * 20;

    // set camera to rotate around center of loaded object
    camera.lookAt(center);
    controls.target = center;
    controls.saveState();
    camera.updateProjectionMatrix();
  } else {
    camera.lookAt(center);
  }

  console.log("123123");
}

function loadTexture(onFinished) {
  if (textureURL == null) {
    onFinished();
    return;
  }
  if (textureURL.length > 0) {
    var text = textureURL.shift();

    textureLoader.load(text, (_texture) => {
      texture = _texture;
      if (mesh.length > 0) {
        for (let i = 0; i < mesh.length; i++) {
          mesh[i].material.map = texture;
          mesh[i].material.needsUpdate = true;
        }
      }
      loadTexture(onFinished);
    });
  } else {
    onFinished();
  }
}

function loadProduct(product) {
  console.log("product11", product);
  currentProduct = product;
  loadObj();
}

function loadObj() {
  if (camera == null || currentProduct == null) {
    return;
  }

  function onProgress(xhr) {
    if (xhr.lengthComputable) {
      var percentComplete = (xhr.loaded / xhr.total) * 100;
      console.log("model " + Math.round(percentComplete, 2) + "% downloaded");
    }
  }

  function onLoad(obj) {
    console.log("obj11", obj);
    if (object != null) {
      mesh = [];
      scene.remove(object);
    }

    object = obj;

    object.traverse(function (child) {
      if (child.isMesh) {
        child.material.shininess = materialShininess;
        if (Array.isArray(child.material)) {
          child.material = child.material[0];
        }
        child.material.specular.setRGB(0.1, 0.1, 0.1);
        child.material.map = texture;
        child.material.side = THREE.DoubleSide;
        if (currentProduct.TextureNormal != null) {
          child.material.normalMap = textureLoader.load(
            currentProduct.TextureNormal
          );
        }

        child.updateMatrix();
        child.meshId = mesh.length;
        mesh.push(child);
      }
    });

    if (currentProduct.PartOpacities != null) {
      for (var i = 0; i < currentProduct.PartOpacities.length; i++) {
        var partOpacity = currentProduct.PartOpacities[i];
        if (mesh.length > partOpacity.ID) {
          mesh[partOpacity.ID].material.opacity = partOpacity.Opacity;
          if (partOpacity.Opacity < 1) {
            var material = mesh[partOpacity.ID].material;
            material.transparent = true;
            material.blending = THREE.CustomBlending;
            material.blendEquation = THREE.AddEquation; //default
            material.blendSrc = THREE.SrcAlphaFactor; //default
            material.blendDst = THREE.OneMinusSrcAlphaFactor; //default
          }
        }
      }
    }
    console.log("1");
    scene.add(object);
    console.log("2");
    if (window.defaultZoom == null) {
      fitCameraToObject(camera, object, 3, controls);
    } else {
      fitCameraToObject(camera, object, window.defaultZoom, controls);
    }

    if (currentProduct.Texture != null) {
      textureURL = null;
      if (currentProduct.Styles != null) {
        let style = currentProduct.Styles[currentProduct.colorIdx];
        if (style.Patterns != null) {
          textureURL =
            style.Patterns[currentProduct.patternIdx].PatternTexture.slice();
          console.log("texture of style " + textureURL);
        }
      }

      if (textureURL == null) {
        textureURL = currentProduct.Texture.slice();
      }
    }
    console.log("123123");
    loadTexture(() => {
      console.log("window.restoreDecals", window.restoreDecals);

      if (window.restoreDecals != null) {
        loadFonts(window.restoreDecals, function () {
          LoadDecals(window.restoreDecals);
          restoreTextures(window.restoreDecals);
        });
      }
    });
  }

  function onError() {}

  if (
    currentProduct !== null &&
    currentProduct.Mesh !== currentMeshUrl &&
    currentProduct.TextureNormal !== currentNormalUrl
  ) {
    currentMeshUrl = currentProduct.Mesh;
    currentNormalUrl = currentProduct.TextureNormal;
    var loader = new OBJLoader();
    loader.load("./mesh/t_shirt.obj", onLoad, onProgress, onError);
  }
}

function insertLogoOnModel(isClear) {
  if (currentLogo != null) {
    if (
      currentLogo.Position === null ||
      typeof currentLogo.Position === "undefined"
    ) {
      currentLogo.Position = new THREE.Vector3(
        intersection.point.x,
        intersection.point.y,
        intersection.point.z
      );
      currentLogo.Orientation = new THREE.Euler();
      currentLogo.Orientation.copy(mouseHelper.rotation);

      let orientationTemp = new THREE.Euler();
      orientationTemp.copy(currentLogo.Orientation);
      orientationTemp.z += (currentLogo.Rotate * Math.PI) / 180;

      var scale = currentLogo.Scale; //params.scale;//params.minScale + Math.random() * ( params.maxScale - params.minScale );
      size.set(
        scale * defaultScale,
        scale * defaultScale,
        scale * defaultScale
      );

      var material = currentLogo.decalMaterial; //.clone();
      //material.map = textureCanvas;
      //material.color.setHex( Math.random() * 0xffffff );

      currentLogo.decalMesh = new THREE.Mesh(
        new THREE.DecalGeometry(
          intersection.mesh,
          currentLogo.Position,
          orientationTemp,
          size
        ),
        material
      );
      currentLogo.decalMesh.logo = currentLogo;
      currentLogo.meshID = intersection.mesh.meshId;

      scene.add(currentLogo.decalMesh);
      decals.push(currentLogo.decalMesh);

      updateLogoOnTab();
    } else {
      scene.remove(currentLogo.decalMesh);
      //scene.remove(currentLogo.decalMesh);

      currentLogo.Position.copy(intersection.point);
      currentLogo.Orientation.copy(mouseHelper.rotation);
      //currentLogo.Orientation.z += currentLogo.Rotate * Math.PI / 180;
      let orientationTemp = new THREE.Euler();
      orientationTemp.copy(currentLogo.Orientation);
      orientationTemp.z += (currentLogo.Rotate * Math.PI) / 180;
      //orientationTemp.z += Math.PI;
      var scale = currentLogo.Scale; //params.scale;//params.minScale + Math.random() * ( params.maxScale - params.minScale );
      size.set(
        scale * defaultScale,
        scale * defaultScale,
        scale * defaultScale
      );

      //var material = currentLogo.decalMaterial;//.clone();
      //material.color.setHex( Math.random() * 0xffffff );

      currentLogo.decalMesh = new THREE.Mesh(
        new THREE.DecalGeometry(
          intersection.mesh,
          currentLogo.Position,
          orientationTemp,
          size
        ),
        currentLogo.decalMaterial
      );
      currentLogo.decalMesh.logo = currentLogo;
      currentLogo.meshID = intersection.mesh.meshId;

      scene.add(currentLogo.decalMesh);

      var temp = [];
      decals.forEach(function (d) {
        if (d.logo.Id !== currentLogo.Id) {
          temp.push(d);
        } else {
          temp.push(currentLogo.decalMesh);
        }
      });
      //decals=[];
      decals = temp;
    }
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  if (controls.enableDamping) controls.update();

  //light_update();

  renderer.render(scene, camera);

  //stats.update();
}

function light_update() {
  light.position.copy(camera.position);
}

function allowDrop(event) {
  event.preventDefault();
}

function drop(ev) {
  var x, y;
  if (ev.changedTouches) {
    getMousePos(ev.changedTouches[0]);
  } else {
    getMousePos(ev);
  }

  draged = false;
  controls.enableRotate = true;
  console.log(currentLogo);
  checkIntersection();
  updateCurrent();
}

function assignUVs(geometry) {
  geometry.faceVertexUvs[0] = [];

  geometry.faces.forEach(function (face) {
    var uvs = [];
    var ids = ["a", "b", "c"];
    for (var i = 0; i < ids.length; i++) {
      var vertex = geometry.vertices[face[ids[i]]].clone();

      var n = vertex.normalize();
      var yaw = 0.5 - Math.atan(n.z, -n.x) / (2.0 * Math.PI);
      var pitch = 0.5 - Math.asin(n.y) / Math.PI;

      var u = yaw,
        v = pitch;
      uvs.Push(new THREE.Vector2(u, v));
    }
    geometry.faceVertexUvs[0].Push(uvs);
  });

  geometry.uvsNeedUpdate = true;
}
