// FIX BROKEN yCollides function
// I don't like getting stuck

const walkSpeedCap = 0.15;
const fallSpeedCap = 0.5;
const g = 0.01; // acceleration due to gravity
const keyAccel = 0.004;
const deadY = -25;
const numStepsPerMove = 10;
const jumpImpulseAccel = g*40;
const wallBumpImpulse = 0.1;

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
  var keyCode = event.which;
  if (keyCode == 87) { // w
    player.accelZ(-keyAccel);
  } 
  else if (keyCode == 83) { // s
    player.accelZ(keyAccel);
  } 
  else if (keyCode == 65) { // a
    player.accelX(-keyAccel);
  } 
  else if (keyCode == 68) { // d
    player.accelX(keyAccel);
  } 
  else if (keyCode == 82) { // r (restart)
    player.setPos(5, 10, 5);
  }
  else if (keyCode == 32) {// space
    player.accelY(jumpImpulseAccel);
  }
  else if (keyCode == 37) { // left arrow
    xoff -= 0.5;
  }
  else if (keyCode == 39) {// right arrow
    xoff += 0.5;
  }
  else if (keyCode == 38) { // up arrow
    zoff -= 0.5;
  }
  else if (keyCode == 40) {// down arrow
    zoff += 0.5;
  }
};

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

let player = new Agent(scene,0,10,0, 0.5, new THREE.MeshBasicMaterial({color: 0xffffff}) );
let computers = [];
for(var i = 0; i < 5; i++){
  computers.push(new Agent(scene, Math.random()*5, 5, Math.random()*5, 0.5, new THREE.MeshBasicMaterial({color: 0x34ebe5})));
}

let game_grid = [];
// bare minimum
for (var dx = -3; dx <= 3; dx++){
  for (var dz = -3; dz <= 3; dz++){
    game_grid.push(new Cell(scene, dx,-1,dz));
  }
}

// for (var i = 0; i < 15; i++) { // spawn cells
  // this is a crappy map
  // maybe draw one? 
  // if you are addicted to procedurally generated stuff, there are better solutions to be though of...
  // let seed_pos = [ Math.floor(Math.random()*30), Math.floor(Math.random()*5)-4, Math.floor(Math.random()*30) ];

  // for (var dx = -7; dx <= 7; dx++){
  //   for (var dz = -7; dz <= 7; dz++){
  //     let prMade = Math.exp(-(dx*dx + dz*dz)/25);
  //     if(Math.random() < prMade){
  //       game_grid.push(new Cell(scene, seed_pos[0]+dx,seed_pos[1],seed_pos[2]+dz));
  //     }
  //   }
  // }
// }

for (var dx = -15; dx <= 15; dx++){
  for (var dz = -15; dz <= 15; dz++){
    game_grid.push(new Cell(scene, dx,-1,dz));
  }
}
game_grid.push(new Cell(scene, 10,0,5));
game_grid.push(new Cell(scene, 9,0,5));
game_grid.push(new Cell(scene, 8,0,5));

game_grid.push(new Cell(scene, 10,0,8));
game_grid.push(new Cell(scene, 9,0,8));
game_grid.push(new Cell(scene, 8,0,8));


camera.rotation.x = -0.5;
let xoff = 0;
let zoff = 0;

function animate() {
	requestAnimationFrame( animate );
  
  for (var i in computers){
    computers[i].update(game_grid);
    computers[i].stupidRandomWalk();
    if(player.xzCollidesWith(computers[i]).collision){
      if(player.yCollisionType(computers[i]) == "this in other"){
        console.log("scrub you are dead");
        player.respawn();
      }
    }
  }

  player.update(game_grid);
  camera.position.x = player.getX()+xoff;
  camera.position.y = player.getY()+3;
  camera.position.z = player.getZ()+5+zoff;


	renderer.render( scene, camera );
}
animate();

