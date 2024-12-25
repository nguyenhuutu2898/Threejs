import * as THREE from "three";

import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DragControls } from "three/examples/jsm/Addons.js";
let camera, scene, renderer, controls, object;
var materialShininess = 25;
init();
animate();

function init() {
  // Tạo scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xeeeeee);

  // Tạo camera
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.z = 220; // Đặt vị trí máy ảnh

  // Tạo renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById("container").appendChild(renderer.domElement);

  // Tạo OrbitControls
  camera.target = new THREE.Vector3();

  controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 10;
  controls.maxDistance = 300;
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.maxPolarAngle = Math.PI;

  // Tạo ánh sáng
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 0.8);
  pointLight.position.set(5, 5, 5);
  scene.add(pointLight);

  // Tải mô hình OBJ
  const objLoader = new OBJLoader();
  objLoader.load("./mesh/t_shirt.obj", (obj) => {
    object = obj;
    object.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
      }
    });
    object.position.set(0, -120, 0); // Đặt đối tượng ở giữa scene

    scene.add(object);

    // Điều chỉnh camera để vừa với đối tượng
    const boundingBox = new THREE.Box3().setFromObject(object);
    const center = boundingBox.getCenter(new THREE.Vector3());

    const size = boundingBox.getSize(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));

    cameraZ *= 3; // Bổ sung thêm khoảng cách
    camera.position.z = center.z + cameraZ;

    camera.lookAt(center);

    controls.target = center;
    controls.update();
  });

  // Xử lý kéo và thả tệp
  const dropArea = renderer.domElement;
  dropArea.addEventListener("dragover", (event) => {
    event.preventDefault();
  });

  dropArea.addEventListener("drop", (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === "image/png") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(e.target.result, (texture) => {
          applyTextureToObject(texture);
        });
      };
      reader.readAsDataURL(file);
    }
  });

  // Xử lý thay đổi kích thước cửa sổ
  window.addEventListener("resize", onWindowResize, false);
}

function applyTextureToObject(texture) {
  if (object) {
    object.traverse((child) => {
      if (child.isMesh) {
        const material = child.material;
        const geometry = child.geometry;

        // Calculate the scaling factor based on target pixel size
        const bbox = new THREE.Box3().setFromObject(child);
        const size = bbox.getSize(new THREE.Vector3());

        const scaleX = 100 / size.x;
        const scaleY = 100 / size.y;

        // Apply the texture scaling
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.repeat.set(scaleX, scaleY);
        child.material.map = texture;
        child.material.needsUpdate = true;

        // child.material.shininess = materialShininess;
        // if (Array.isArray(child.material)) {
        //   child.material = child.material[0];
        // }
        // // child.material.specular.setRGB(0.1, 0.1, 0.1);
        // child.material.map = texture;
        // child.material.side = THREE.DoubleSide;

        // child.updateMatrix();
        // child.meshId = mesh.length;
        // mesh.push(child);
      }
    });
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
