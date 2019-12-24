const speed = 0.4;
const lightSpeed = 0.03;

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
  var keyCode = event.which;
  if (keyCode == 87) { // w
    playerPos.z -= speed;
  } 
  else if (keyCode == 83) { // s
    playerPos.z += speed;
  } 
  if (keyCode == 65) { // a
    playerPos.x -= speed;
  } 
  else if (keyCode == 68) { // d
    playerPos.x += speed;
  } 
  if (keyCode == 70){ // f
    playerPos.y -= speed;
  }
  else if (keyCode == 82){ // r
    playerPos.y += speed;
  }
};

let WIDTH = window.innerWidth;
let HEIGHT = window.innerHeight;
var renderer = new THREE.WebGLRenderer();
renderer.setClearColor (0x000000, 1);
renderer.setSize(WIDTH, HEIGHT);
document.body.appendChild( renderer.domElement );

var scene = new THREE.Scene();

let light = new THREE.AmbientLight(0x000000);
scene.add(light);

const spacing = 4;
const decay = 0.7;
const numBoxes = 6;
const dim = spacing*numBoxes;
const center = new THREE.Vector3(dim/2,dim/2,dim/2);

for (let x = 0; x < numBoxes; x++){
  for (let y = 0; y < numBoxes; y++){
    for (let z = 0; z < numBoxes; z++){
      const geometry = new THREE.BoxGeometry(1,1,1);
      const material = new THREE.MeshPhongMaterial({color: 0x44aa88});  // green-blue
      const cube = new THREE.Mesh(geometry, material);
      cube.rotation.x = Math.random()*Math.PI*2;
      cube.rotation.y = Math.random()*Math.PI*2;
      cube.rotation.z = Math.random()*Math.PI*2;
      cube.position.x = (x+(Math.random()-0.5)*decay)*spacing;
      cube.position.y = (y+(Math.random()-0.5)*decay)*spacing;
      cube.position.z = (z+(Math.random()-0.5)*decay)*spacing;
      scene.add(cube);
    }
  }
}

let ptLights = [];
let ptLightBlobs = [];
let ptLightVels = [];
let ptLightColors = ["#ffff00", "#0000ff", "#00ff00", "#ff0000"];

for(let i in ptLightColors){
  ptLights.push( new THREE.PointLight( ptLightColors[i], 1, 100, 2) );
  scene.add(ptLights[i]);

  ptLightVels.push(new THREE.Vector3(Math.random(), Math.random(), Math.random()));
  ptLightVels[i].normalize();
  ptLightVels[i].multiplyScalar(lightSpeed);


  const geometry = new THREE.SphereGeometry(0.25, 32, 32);
  const material = new THREE.MeshPhongMaterial({color: ptLightColors[i], emissive: ptLightColors[i]});
  ptLightBlobs.push(new THREE.Mesh(geometry, material));
  scene.add(ptLightBlobs[i]);

  ptLights[i].position.set(Math.random()*dim, Math.random()*dim, Math.random()*dim);
  ptLightBlobs[i].position.copy(ptLights[i].position);

}


var camera = new THREE.PerspectiveCamera( 75, WIDTH / HEIGHT, 0.1, 1000 ); window.addEventListener('resize', function() { WIDTH = window.innerWidth; HEIGHT = window.innerHeight;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
});


// this isn't cool and smooth YET ;0
function alekRandomWalk(i){
  if (Math.random() < 0.003){
    console.log("its the wind");
    // push in a random dirrection
    ptLightVels[i].add(new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5));
    ptLightVels[i].normalize();
    ptLightVels[i].multiplyScalar(lightSpeed);
  }
  ptLights[i].position.add(ptLightVels[i]);

  if(ptLights[i].position.x < 0 || ptLights[i].position.x > dim ||
    ptLights[i].position.y < 0 || ptLights[i].position.y > dim ||
    ptLights[i].position.z < 0 || ptLights[i].position.z > dim){

    console.log(i + " getting bumped");

    // if() {// vel not "pointing at center"
      ptLightVels[i].subVectors(center, ptLights[i].position);
      ptLightVels[i].normalize();
      ptLightVels[i].multiplyScalar(lightSpeed);
      ptLights[i].position.add(ptLightVels[i]);
    // }
  }

  ptLightBlobs[i].position.copy(ptLights[i].position);
}


let playerPos = new THREE.Vector3(dim/2,dim/2,dim/2);

function animate() {
	requestAnimationFrame( animate );
  camera.position.x = playerPos.x;
  camera.position.y = playerPos.y;
  camera.position.z = playerPos.z;

  for(let i in ptLights){
    alekRandomWalk(i);
  }

	renderer.render( scene, camera );
}
animate();

