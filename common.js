import * as THREE from "three";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";

const width = window.innerWidth;
const height = window.innerHeight;

const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
camera.position.z = 10;

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor(0xd1d1d1);
renderer.setSize(width, height);
renderer.setPixelRatio(window.devicePixelRatio);

document.body.appendChild(renderer.domElement);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// свет
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const light2 = new THREE.PointLight(0xffffff, 0.8, 18);
light2.position.set(-3, 6, -3);
light2.castShadow = true;
scene.add(light2);

const sunLight = new THREE.DirectionalLight(0xffffff, 1);
sunLight.position.set(5, 10, 5);
sunLight.castShadow = true;
scene.add(sunLight);

// загрузка glTF
const loader = new GLTFLoader();
let mixer;
loader.load(
    "scene.gltf",
    (gltf) => {
        const model = gltf.scene;
        scene.add(model);
        model.position.set(0, 0, 0);
        model.scale.set(1, 1, 1);

        model.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0xea5355
                });
            }
        });

        if (gltf.animations.length) {
            mixer = new THREE.AnimationMixer(model);
            gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
        }
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
        console.error("Ошибка при загрузке модели:", error);
    }
);

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);

    if (scene.children.length > 0) {
        const model = scene.children.find((c) => c.type === "Group");
        if (model) {
            model.rotation.y += 0.01;
        }
    }

    renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
