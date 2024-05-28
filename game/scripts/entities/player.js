import { Entity } from "./entity";
import { PerspectiveCamera, Vector3 } from "three";
import { CheckCollision, CheckCollisionInBlock } from "../controls/collision";

const UP = new Vector3(0, 1, 0);

export class Player extends Entity {
  constructor(name, x = 0, y = 0, z = 0) {
    super();
    this.name = name;
    this.data = {
      health: 20,
      max_health: 20,
      position: new Vector3(x, y, z),
      out: new Vector3(9, 9, 9),
      messagesQueue: [],
      yvelocity: 0,
      xvelocity: 0,
      zvelocity: 0,
      placeDelay: 0,
    };
    this.block = 0;
    this.holdKeys = {
      forward: false,
      backward: false,
      right: false,
      left: false,
      sprint: false,
      crounch: false,
      jump: false,
      placing: false,
      breaking: false,
    };
    this.breaking = { time: 0, x: 0, y: 0, z: 0, block: 0 };
    this.inFloor = false;
    this.isJumping = false;
    this.acceleration = 0;
    this.mass = 1.75;
    this.speed = 7;

    this.chunks = [];

    this.camera = new PerspectiveCamera();
    this.cameraVec = new Vector3();
    this.matrixWorld = new Array(16);
    this.end = new Vector3();
    this.start = new Vector3();
  }
  update(packet, chat) {
    this.holdKeys = packet.data.player.holdKeys;
    this.camera = packet.data.player.camera.object;
    this.start = packet.data.start;
    this.end = packet.data.end;
    this.block = packet.data.player.block;
    this.chunks = packet.data.chunks;
    if(packet.data.player.data.forceDelayReset){
      this.data.placeDelay = 0;
    }
    //console.log(this.chunks);
    //console.log(this.camera )
    if (packet.data.player.data.messagesQueue.length > 0) {
      for (let msg of packet.data.player.data.messagesQueue) {
        chat.send(msg);
        console.log(msg);
      }
    }
  }
  movement(delta, level) {
    if (this.isPaused) {
      return;
    }
    if (this.data.placeDelay > 0) {
      this.data.placeDelay -= delta;
    } else if (this.data.placeDelay != 0) {
      this.data.placeDelay = 0;
    }

    let velocity = this.holdKeys.crounch
      ? this.speed * 0.5
      : this.holdKeys.sprint
        ? this.speed * 1.25
        : this.speed;
    let xvelocity = 0;
    let zvelocity = 0;
    // Movement
    if (this.holdKeys.forward != this.holdKeys.backward) {
      let sign = this.holdKeys.forward ? 1 : -1;
      this.cameraVec
        .set(
          this.camera.matrix[0],
          this.camera.matrix[1],
          this.camera.matrix[2],
        )
        .crossVectors(new Vector3(0, 1, 0), this.cameraVec);
      xvelocity += this.cameraVec.x * velocity * delta * sign;
      zvelocity += this.cameraVec.z * velocity * delta * sign;
      // Divide by 2 to avoid increased speed on moving two axis at the same time
      velocity *= 0.5;
    }
    //console.log(this.cameraVec)
    if (this.holdKeys.right != this.holdKeys.left) {
      let sign = this.holdKeys.right ? 1 : -1;
      this.cameraVec.set(
        this.camera.matrix[0],
        this.camera.matrix[1],
        this.camera.matrix[2],
      );

      xvelocity += this.cameraVec.x * velocity * delta * sign;
      zvelocity += this.cameraVec.z * velocity * delta * sign;

      // Divide by 2 to avoid increased speed on moving two axis at the same time
    }

    //console.log(xvelocity, this.yvelocity, zvelocity)

    xvelocity += xvelocity * 0.01 * !this.inFloor;
    zvelocity += zvelocity * 0.01 * !this.inFloor;

    if (CheckCollision(this.data.position, level, [xvelocity, 0, 0])) {
      this.data.position.x += xvelocity;
    }

    if (CheckCollision(this.data.position, level, [0, 0, zvelocity])) {
      this.data.position.z += zvelocity;
    }

    this.acceleration += -1;
    if (this.inFloor) this.isJumping = this.holdKeys.jump;

    if (this.isJumping) {
      this.acceleration += 17;
      this.isJumping = false;
    }

    this.acceleration /= this.mass;
    this.data.yvelocity += this.acceleration;

    if (
      CheckCollision(this.data.position, level, [
        0,
        this.data.yvelocity * delta,
        0,
      ])
    ) {
      this.data.position.y += this.data.yvelocity * delta;
      this.inFloor = false;
    } else {
      this.inFloor = true;

      if (this.data.yvelocity < -15.5) {
        this.data.health += this.data.yvelocity * 0.2;
        if (this.data.health <= 0) {
          //this.data.position.set(0, 50, 0);
          this.data.health = this.data.max_health;
        }
        //console.log(this.yvelocity)
      }
      this.data.yvelocity = 0;
    }
    this.acceleration = 0;
  }
  placeVoxel(level, delta) {
    const intersection = this.intersectRay(level);
    if (intersection) {
      //const voxelId = currentVoxel;
      const pos = intersection.position.map((v, ndx) => {
        //console.log( v, ndx )
        return (
          v +
          intersection.normal[ndx] *
            (this.holdKeys.placing && this.data.placeDelay == 0 ? 0.5 : -0.5)
        );
      });

      let outUpdate = true;

      if (this.holdKeys.placing && this.data.placeDelay == 0) {
        this.data.placeDelay = 0.45;

        let fixedPos = this.data.position.clone().add(UP);

        if (fixedPos.distanceTo(new Vector3().fromArray(pos, 0)) > 1) {
          level.setBlock(
            Math.floor(pos[0]),
            Math.floor(pos[1]),
            Math.floor(pos[2]),
            this.block,
          );
        } else {
          outUpdate = false;
        }
      } else if (this.holdKeys.breaking && this.data.placeDelay == 0) {
        level.setBlock(
          Math.floor(pos[0]),
          Math.floor(pos[1]),
          Math.floor(pos[2]),
          0,
        );
        this.data.placeDelay = 0.45;
      } else if (this.data.placeDelay != 0) {
        this.data.placeDelay -= delta;
        if (this.data.placeDelay < 0.01) this.data.placeDelay = 0;
      }

      if (outUpdate) {
        this.data.out
          .set(...pos)
          .floor()
          .addScalar(0.5);
      } else {
        this.data.out.set(0, 0, 0);
      }
    }
  }

  intersectRay(level) {
    let dx = this.end.x - this.start.x;
    let dy = this.end.y - this.start.y;
    let dz = this.end.z - this.start.z;
    const lenSq = dx * dx + dy * dy + dz * dz;
    const len = Math.sqrt(lenSq);

    dx /= len;
    dy /= len;
    dz /= len;

    let t = 0.0;
    let ix = Math.floor(this.start.x);
    let iy = Math.floor(this.start.y);
    let iz = Math.floor(this.start.z);

    const stepX = dx > 0 ? 1 : -1;
    const stepY = dy > 0 ? 1 : -1;
    const stepZ = dz > 0 ? 1 : -1;

    const txDelta = Math.abs(1 / dx);
    const tyDelta = Math.abs(1 / dy);
    const tzDelta = Math.abs(1 / dz);

    const xDist = stepX > 0 ? ix + 1 - this.start.x : this.start.x - ix;
    const yDist = stepY > 0 ? iy + 1 - this.start.y : this.start.y - iy;
    const zDist = stepZ > 0 ? iz + 1 - this.start.z : this.start.z - iz;

    // location of nearest voxel boundary, in units of t
    let txMax = txDelta < Infinity ? txDelta * xDist : Infinity;
    let tyMax = tyDelta < Infinity ? tyDelta * yDist : Infinity;
    let tzMax = tzDelta < Infinity ? tzDelta * zDist : Infinity;

    let steppedIndex = -1;

    // main loop along raycast vector
    while (t <= len) {
      const voxel = level.getBlock(ix, iy, iz);
      if (voxel) {
        return {
          position: [
            this.start.x + t * dx,
            this.start.y + t * dy,
            this.start.z + t * dz,
          ],
          normal: [
            steppedIndex === 0 ? -stepX : 0,
            steppedIndex === 1 ? -stepY : 0,
            steppedIndex === 2 ? -stepZ : 0,
          ],
          voxel,
        };
      }

      // advance t to next nearest voxel boundary
      if (txMax < tyMax) {
        if (txMax < tzMax) {
          ix += stepX;
          t = txMax;
          txMax += txDelta;
          steppedIndex = 0;
        } else {
          iz += stepZ;
          t = tzMax;
          tzMax += tzDelta;
          steppedIndex = 2;
        }
      } else {
        if (tyMax < tzMax) {
          iy += stepY;
          t = tyMax;
          tyMax += tyDelta;
          steppedIndex = 1;
        } else {
          iz += stepZ;
          t = tzMax;
          tzMax += tzDelta;
          steppedIndex = 2;
        }
      }
    }

    return null;
  }
}
