class Agent extends Blob {
  move(dx, dy, dz){
    this.mesh.position.x += dx;
    if(!this.flying){
      this.mesh.position.y += dy;
    }
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
  yCollisionType(otherBlob){
    let bottomToTopDiff = (this.getY()-this.getSize()/2) - (otherBlob.getY()+otherBlob.getSize()/2);
    if(bottomToTopDiff < -(this.getSize() + otherBlob.getSize())){
      return "this below other";
    }
    else if (bottomToTopDiff < 0){
      return "this in other";
    }
    else if(bottomToTopDiff < fallSpeedCap/numStepsPerMove){
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

  substantialIntersectionArea(yOnxzIntersectionAreaTotal){
    return yOnxzIntersectionAreaTotal > Math.pow(this.getSize(), 2)/2
  }

  update(game_grid){
    for(let itter = 0; itter < numStepsPerMove; itter++){
      if(this.getY() < deadY) {
        this.respawn();
      }

      for (let xMove = 0; xMove < 2; xMove++){
        if(xMove){
          this.move(this.vel.x/numStepsPerMove, 0, 0);
        }
        else{
          this.move(0,0,this.vel.z/numStepsPerMove);
        }
        let falling = true;
        let yOnxzIntersectionAreaTotal = 0;
        for ( i in game_grid ){
          let xzCollision = this.xzCollidesWith(game_grid[i]);
          if(xzCollision.collision){
            let yCollision = this.yCollisionType(game_grid[i]);
            if (yCollision == "this on other"){
              yOnxzIntersectionAreaTotal += xzCollision.intersection_area;
              if(this.substantialIntersectionArea(yOnxzIntersectionAreaTotal)){
                falling = false;
                if (this.vel.y < 0){
                  this.vel.y = 0;
                  break;
                }
              }
            }
            else if (yCollision == "this in other") {
              // console.log("in other");
              // this.move(2*(Math.round(this.getX())-this.getX()), 0, 2*(Math.round(this.getZ())-this.getZ()));
              if(xMove){
                let dxcms = Math.sign(this.getX() - game_grid[i].getX())*wallBumpImpulse;
                this.move(-this.vel.x/numStepsPerMove, 0, 0);
                this.move(dxcms,0,0);
                this.vel.x = 0;
              }
              else {
                let dzcms = Math.sign(this.getZ() - game_grid[i].getZ())*wallBumpImpulse;
                this.move(0, 0, -this.vel.z/numStepsPerMove);
                this.move(0,0,dzcms);
                this.vel.z = 0;
              }
            }
          }
        }

        // console.log(yOnxzIntersectionAreaTotal);
        if (falling){
          if (this.vel.y - g > -fallSpeedCap){
            this.vel.y -= g/numStepsPerMove;
          }
        }
      }
      this.move(0, this.vel.y/numStepsPerMove, 0);
    }
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
