import { chunkSize, chunkSizeQuad } from '../constants';
import hyperid from 'hyperid';

const instance = hyperid();

export class Chunk {
  constructor(position = { x: 0, y: 0, z: 0 }, Noise, NoiseDepth, NoiseCave, NoiseTree) {
    this.blockLength = chunkSize ** 3;
    this.position = position;
    this.blocks = new Uint8Array(chunkSize ** 3).fill(0);
    this.entities = []
    this.keyRender = "";
    this.empty = true
    this.neighboors = []
    this.needRender = true
    this.id = this.getID()
    for (let y = 0; y < chunkSize; y++)
      for (let x = 0; x < chunkSize; x++)
        for (let z = 0; z < chunkSize; z++) {
          let cx = this.position.x * chunkSize + x; let cy = this.position.y * chunkSize + y; let cz = this.position.z * chunkSize + z;
          let h1 = Noise.GetNoise(cx, cz) * 32;
          let h2 = NoiseDepth.GetNoise(cx / 8, cz / 8) * 100;
          let height = Math.floor(h1 + h2);
          if (cy < height) {
            if (cy == height - 1) this.setBlock(x, y, z, cy > 3 ? 1 : 11, false)
            /*else if (cy < height - 10) {
              this.setBlock(x, y, z, NoiseCave.GetNoise(cx, cy, cz) > -0.5 ? 4 : 0, false);
            }*/
            else this.setBlock(x, y, z, cy > 2 ? 2 : 11, false)
          }
        }
    this.updateMesh();
  }

  updateMesh() {
    this.keyRender = instance();
  }

  setBlock(x, y, z, id, k = true) {
    //let perf = 0;
    //if(k) perf = performance.now()
    this.blocks[y * chunkSizeQuad + x * chunkSize + z] = id;
    if (k) this.updateMesh();
    if (this.empty) this.empty = false
    //if(k) console.log((performance.now()-perf)/1000)
  }

  getBlock(x, y, z) {
    return this.blocks[y * chunkSizeQuad + x * chunkSize + z]
  }

  getFace(d) {
    let face = new Uint8Array(chunkSize ** 2).fill(0);
    for (let x = 0; x < chunkSize; x++) for (let y = 0; y < chunkSize; y++) face[x * chunkSize + y] = this.getBlockDimension(d, 0, x, y)
    return face
  }

  getBlockDimension(d, l, x, y) {
    if (d == 0) return this.blocks[y * chunkSizeQuad + x * chunkSize + l]
    else if (d == 1) return this.blocks[x * chunkSizeQuad + l * chunkSize + y]
    return this.blocks[l * chunkSizeQuad + x * chunkSize + y]
  }

  getID() {
    return this.position.x + "_" + this.position.y + "_" + this.position.z;
  }
}

