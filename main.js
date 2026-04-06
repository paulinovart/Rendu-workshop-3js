//imports
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DragControls } from "three/addons/controls/DragControls.js";
import { roughness, texture } from "three/tsl";

//scene

const scene = new THREE.Scene();

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(1, 1);
let oldHoverObject = null;
let clickedObject = null;


const viewport = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const camera = new THREE.PerspectiveCamera(
  45,
  viewport.width / viewport.height,
  1e-6,
  1e27
);
const sunLightColor = 0xFFFFFF;
const sunIntensity = 150;
const sunLight = new THREE.PointLight(sunLightColor, sunIntensity);
scene.add(sunLight);


const color = 0xFFFFFF;
const intensity = 0.5;
const light = new THREE.AmbientLight(color, intensity);
scene.add(light);




let cameraPosition = new THREE.Vector3();
camera.position.set(0, 20, 20);
camera.lookAt(0, 0, 0);

//state
let controls, renderer, whiteCircle, baseScale,circlePoint, planetPoint;
let planets = [];
let whiteCircles = [];
let objects = [];

async function init() {
  initRenderer();
  initControls();
  initScene();
  //initHelpers();

  window.onresize = onWindowResize;
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("click", onClick)

}

function onMouseMove(event) {
  event.preventDefault();

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersection = raycaster.intersectObjects(whiteCircles);

  const hoveredObject = intersection[0]?.object ?? null;
  if (hoveredObject !== oldHoverObject) {
    oldHoverObject = hoveredObject;
  }
}




function onClick() {
  // set lers variables position base cam et target (lookat)
  //set la variable de destination 

//au click un lerp qui fonctionne avec la position de départ de la cam
  raycaster.setFromCamera(mouse, camera);

  const intersection = raycaster.intersectObjects(whiteCircles);
  //console.log(whiteCircles);
  //intersection[0].object.name = "active";
 whiteCircles.forEach((object)=> (object.name =""));

if (intersection.length){
clickedObject = intersection[0].object
camera.position.set(clickedObject.position.x,clickedObject.position.y, clickedObject.position.z+0.003 )
controls.target.set(clickedObject.position.x,clickedObject.position.y, clickedObject.position.z);
console.log("je clique sur : ", clickedObject)
clickedObject.name="active";

}else {
 // camera.position.set(0, 20, 20);
 //controls.target.set(0, 0, 0);

}
}



function initRenderer() {
  renderer = new THREE.WebGLRenderer({
    logarithmicDepthBuffer: true,
  });
  renderer.setSize(viewport.width, viewport.height);
  renderer.domElement.classList.add("renderer");

  document.body.appendChild(renderer.domElement);
  renderer.setPixelRatio(2);
  renderer.setAnimationLoop(animate);
}

function initScene() {
  //là ou je mets tt ma scene, mes objets etc

  /*
-------------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------
FONCTION CREATION TEXTE
-------------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------
 */

  function afficherLegende(message) {
    const canvas = document.createElement("canvas");

    const contexte = canvas.getContext("2d");

    contexte.font = "90px Arial";
    contexte.fillStyle = "#ffffff";
    contexte.textAlign = "center";
    contexte.textBaseline = "middle";
    contexte.fillText(message, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: texture, transparent: true })
    );

    sprite.scale.set(4, 0.5, 1);

    return sprite;
  }

  /*
-------------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------
ORBITES TRY FOR EACH
-------------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------
 */

  planets = [
    {
      nom: "Mercury",
      x: 1.2,
      y: 1.2,
      color: 0xb78668,
      p: 0.1,
      planetRadius: 0.00005,
      baseColor : "textures/mercury.jpg",
      roughness : "texture/mercury-r.jpg",
    },

    {
      nom: "Venus",
      x: 2.2,
      y: 2.2,
      color: 0xf4bebe,
      p: 0.2,
      planetRadius: 0.00012,
       baseColor : "textures/venus.jpg",
       roughness : "texture/venus-r.jpg",
    },

    {
      nom: "Earth",
      x: 3,
      y: 3,
      color: 0x67bc5e,
      p: 0.7,
      planetRadius: 0.00013,
      baseColor : "textures/earth.jpg",
      roughness : "texture/earth-r.jpg",
    },

    /*{
  nom : "moonOrbit",
  x : ,
  y : 
},*/
    {
      nom: "Mars",
      x: 4.6,
      y: 4.6,
      color: 0xdd4530,
      //color : "linear-gradient(267deg,rgba(221, 69, 48, 0.69) 0%, rgba(221, 69, 48, 0) 100%)",
      p: 1,
      planetRadius: 0.00007,
       baseColor : "textures/mars.jpg",
       roughness : "texture/mars-r.jpg",
    },
    {
      nom: "Jupiter",
      x: 15.6,
      y: 15.6,
      color: 0xf9d3c0,
      p: 0.4,
      planetRadius: 0.00143,
       baseColor : "textures/jupiter.jpeg",
    },
    {
      nom: "Saturn",
      x: 30,
      y: 30,
      color: 0xffe577,
      p: 0.8,
      planetRadius: 0.0012,
       baseColor : "textures/saturn.jpeg",

    },
    {
      nom: "Uranus",
      x: 57,
      y: 57,
      color: 0x57a0ff,
      p: 0,
      planetRadius: 0.00051,
       baseColor : "textures/uranus.jpeg",
    },
    {
      nom: "Neptune",
      x: 90,
      y: 90,
      color: 0x2948bf,
      p: 0.5,
      planetRadius: 0.00049,
      baseColor : "textures/neptune.jpeg",
    },
  ];

  const circleTexture = new THREE.TextureLoader().load("textures/circle.png");
  const circleMaterial = new THREE.SpriteMaterial({
    map: circleTexture,
    transparent: true,
  });

  planets.forEach((orbit) => {
    const curve = new THREE.EllipseCurve(
      0,
      0,
      orbit.x,
      orbit.y,
      0,
      2 * Math.PI,
      false,
      0
    );

    circlePoint = curve.getPoint(orbit.p);
    circlePoint.push;

    //création des orbites

    orbit.curve = curve;

    const points = curve.getPoints(100);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: orbit.color });


    const ellipse = new THREE.Line(geometry, material);
    ellipse.rotation.x = -Math.PI / 2;
    scene.add(ellipse);
    console.log("orbite crée : ", orbit.nom);

    //création des planetes

    const texloader = new THREE.TextureLoader();
    const planetTexture = texloader.load(orbit.baseColor);
    const planetTextureRoughness = texloader.load(orbit.roughness);
    //console.log(orbit.baseColor);
    planetTexture.colorSpace = THREE.SRGBColorSpace;


    const planetGeometry = new THREE.SphereGeometry(orbit.planetRadius, 32, 16); // augmenter
    //const planetGeometry = new THREE.SphereGeometry(20,32,16);
    const planetMaterial = new THREE.MeshPhysicalMaterial({
      //color: orbit.color,
      map: planetTexture,
      roughnessMap : planetTextureRoughness,
      // normalmap => fausser des reliefs
      
    });

    // ligne à dupliquer pour les materiaux



    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    planetPoint = { x: circlePoint.x, y: circlePoint.y };
    planetPoint.push;
    console.log(planetPoint, "planetPoint");
    planet.position.set(planetPoint.x, 0, planetPoint.y);
    scene.add(planet);
    console.log("planète crée : ", orbit.nom);

    //ajout du rond marqueur de l'emplacement de la planete

    whiteCircle = new THREE.Sprite(circleMaterial);
    whiteCircle.scale.set(0.5, 0.5, 1); // taille visuelle

    whiteCircle.position.set(circlePoint.x, 0, circlePoint.y);
    scene.add(whiteCircle);

    whiteCircle.userData.planet = planet;

    orbit.sprite = whiteCircle;
    whiteCircles.push(whiteCircle);

    //const dragControls = new DragControls(objects, camera, renderer.domElement);

    // afficher la légende (nom de la planète) en dessous de chaque cercle
    const legende = afficherLegende(orbit.nom, {
      fontsize: 50,
      color: "#ffffff",
    });
    legende.position.set(circlePoint.x, 0, circlePoint.y - 0.3); // juste en dessous du cercle
    scene.add(legende);
    orbit.textSprite = legende;
  });
}

function initControls() {
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = true;
 controls.autoRotate = true;
  controls.autoRotateSpeed = true;
  controls.enableDamping = true;
}

function initHelpers() {
  const gridHelper = new THREE.GridHelper(10, 20);
  const axesHelper = new THREE.AxesHelper(5);
  gridHelper.position.y = -0.5;

  scene.add(gridHelper, axesHelper);
}

function onWindowResize() {
  viewport.width = window.innerWidth;
  viewport.height = window.innerHeight;
  camera.aspect = viewport.width / viewport.height;
  camera.updateProjectionMatrix();

  renderer.setSize(viewport.width, viewport.height);
}


function animate() {
  // adapter la taille du sprite selon la distance caméra
  planets.forEach((orbit) => {
    
    const distanceCamera = camera.position.distanceTo(orbit.sprite.position);
    baseScale = distanceCamera * 0.05;
    //console.log(baseScale, orbit.nom);

    if (orbit.sprite.name === "active"){

      orbit.sprite.scale.set(baseScale * 2, baseScale * 2, 1);
    } else if (orbit.sprite === oldHoverObject){
      orbit.sprite.scale.set(baseScale * 2, baseScale * 2, 1);

    } else {
      orbit.sprite.scale.set(baseScale, baseScale, 1);
    }

    orbit.textSprite.scale.set(baseScale, baseScale * 0.5, 1);


  });


  controls.update();
  renderer.render(scene, camera);
}

init();
