// FIX BROKEN yCollides function

const walkSpeedCap = 0.15;
const fallSpeedCap = 0.5;
const g = 0.01; // acceleration due to gravity
const keyAccel = 0.004;
const jumpImpulseAccel = g*20;
const wallBumpImpulseAccel = walkSpeedCap*2;
const deadY = -25;

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

// NOTE: all blobs must be 1 by 1 by 1 cubes
// collision detection depends on this!
class Blob {
  constructor(scene,x,y,z, size, material){
    this.size = size || 1;
    this.geometry = new THREE.BoxGeometry(this.size, this.size, this.size);
    this.material = material || new THREE.MeshNormalMaterial();
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    scene.add(this.mesh);

    // update center position
    this.setPos(x,y,z);
    this.vel = new THREE.Vector3(0,0,0);
  }

  setPos(x,y,z){
    this.mesh.position.x = x;
    this.mesh.position.y = y;
    this.mesh.position.z = z;
  }

  getX(){
    return this.mesh.position.x;
  }
  getY(){
    return this.mesh.position.y;
  }
  getZ(){
    return this.mesh.position.z;
  }
  getSize(){
    return this.size;
  }

  xzCollidesWith(otherBlob){

    let xDiff = Math.min(otherBlob.getX()+otherBlob.getSize()/2, this.getX()+this.getSize()/2) 
      - Math.max(otherBlob.getX()-otherBlob.getSize()/2, this.getX()-this.getSize()/2)
    let zDiff = Math.min(otherBlob.getZ()+otherBlob.getSize()/2, this.getZ()+this.getSize()/2) 
      - Math.max(otherBlob.getZ()-otherBlob.getSize()/2, this.getZ()-this.getSize()/2);

    return {"collision": xDiff > 0 && zDiff > 0, "intersection_area": Math.abs(xDiff*zDiff)};
  }
}

class Agent extends Blob {
  move(dx, dy, dz){
    this.mesh.position.x += dx;
    this.mesh.position.y += dy;
    this.mesh.position.z += dz;
  }
  accelX(ax){
    if (Math.abs(this.vel.x + ax) < walkSpeedCap || Math.abs(this.vel.x + ax) < Math.abs(this.vel.x))
      this.vel.x += ax;
  }
  accelY(ay){
    if (this.vel.y == 0)
      this.vel.y += ay;
  }
  accelZ(az){
    if (Math.abs(this.vel.z + az) < walkSpeedCap || Math.abs(this.vel.z + az) < Math.abs(this.vel.z))
      this.vel.z += az;
  }

  // assumes this.xzCollidesWith(otherBlob) is true...
  //
  // XXX: this should depend on otherBlob.getSize
  yCollisionType(otherBlob){
    let bottomToTopDiff = (this.getY()-this.getSize()/2) - (otherBlob.getY()+otherBlob.getSize()/2);
    if(bottomToTopDiff < -2){
      return "this below other";
    }
    else if (bottomToTopDiff < 0){
      return "this in other";
    }
    else if(bottomToTopDiff < fallSpeedCap){
      return "this on other";
    }
    else {
      return "this above other";
    }
  }

  respawn(){
    this.move((Math.random()-0.5)*5-this.getX(),-this.getY() + 10,(Math.random()-0.5)*5-this.getZ());
    this.vel.x = 0;
    this.vel.y = 0;
    this.vel.z = 0;
  }

  update(game_grid){
    if(this.getY() < deadY) {
      this.respawn();
    }

    let falling = true;
    // oh yuck, block it up (no octrees sorry)
    let yOnxzIntersectionAreaTotal = 0;
    for ( i in game_grid ){
      let xzCollision = this.xzCollidesWith(game_grid[i]);
      if(xzCollision.collision){
        let yCollision = this.yCollisionType(game_grid[i]);
        if (yCollision == "this on other"){
          yOnxzIntersectionAreaTotal += xzCollision.intersection_area;
          if(yOnxzIntersectionAreaTotal > Math.pow(this.getSize()*game_grid[i].getSize(), 2)/2){
            falling = false;
            if (this.vel.y < 0){
              this.vel.y = 0;
              break;
            }
          }
        }
        else if (yCollision == "this in other") {
          // this doesn't actually make any physicsy sense
          // this.vel.x = -Math.sign(this.vel.x) * wallBumpImpulseAccel;
          // this.vel.z = -Math.sign(this.vel.z) * wallBumpImpulseAccel;
          // this.setPos(Math.round(this.getX()), this.getY(), Math.round(this.getZ()));
          this.vel.x *= -1;
          this.vel.z *= -1;
          this.move(this.vel.x, 0, this.vel.z);
        }
      }
    }

    console.log(yOnxzIntersectionAreaTotal);
    if (falling){
      if (this.vel.y - g > -fallSpeedCap){
        this.vel.y -= g;
      }
    }

    this.move(this.vel.x, this.vel.y, this.vel.z);
  }

  stupidRandomWalk(){
    if(Math.random() < 0.2){
      this.accelY(jumpImpulseAccel);
    }
    if(Math.random()<0.2){
      this.accelZ(Math.sign(Math.random()-0.5)*keyAccel);
    }
    if(Math.random()<0.2){
      this.accelX(Math.sign(Math.random()-0.5)*keyAccel);
    }
  }
}


class Cell extends Blob {

}

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

for (var i = 0; i < 15; i++) { // spawn cells
  // this is a crappy map
  // maybe draw one? 
  // if you are addicted to procedurally generated stuff, there are better solutions to be though of...
  let seed_pos = [ Math.floor(Math.random()*30), Math.floor(Math.random()*5)-4, Math.floor(Math.random()*30) ];

  // make this !!random!! later
  for (var dx = -7; dx <= 7; dx++){
    for (var dz = -7; dz <= 7; dz++){
      let prMade = Math.exp(-(dx*dx + dz*dz)/25);
      if(Math.random() < prMade){
        game_grid.push(new Cell(scene, seed_pos[0]+dx,seed_pos[1],seed_pos[2]+dz));
      }
    }
  }
}

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
        alert("scrub you are dead");
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

