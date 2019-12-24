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
    this.flying = false;
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

