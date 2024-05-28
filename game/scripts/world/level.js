import { Chunk } from "./chunk.mjs";
import { chunkSize } from "../constants";
import { CoordsToCCoords } from "../utils/coordinates";
import FastNoiseLite from "../utils/noise";

const seed = 756587001;

const chunkSizeThree = chunkSize - 3;

export default class Level {
  constructor() {
    this.chunks = [[]];
    this.noise = new FastNoiseLite(seed);
    this.noise.SetNoiseType(FastNoiseLite.NoiseType.Perlin);
    this.noiseDepth = new FastNoiseLite(10101010);
    this.noiseDepth.SetNoiseType(FastNoiseLite.NoiseType.Perlin);
    this.noiseCave = new FastNoiseLite(seed + 19231);
    this.noiseCave.SetNoiseType(FastNoiseLite.NoiseType.OpenSimplex2S);
    this.noiseCave.SetFractalOctaves(2);
    this.noiseTree = new FastNoiseLite(seed + 19231);
    this.noiseTree.SetNoiseType(FastNoiseLite.NoiseType.Perlin);
    this.noiseTree.SetFrequency(0.9);
  }

  getChunk(x, y, z) {
    if (!this.chunks[y]) this.chunks[y] = [];
    if (!this.chunks[y][x]) this.chunks[y][x] = [];
    if (!this.chunks[y][x][z]) {
      this.chunks[y][x][z] = new Chunk(
        { x: x, y: y, z: z },
        this.noise,
        this.noiseDepth,
        this.noiseCave,
        this.noiseTree,
      );
      //this.genTrees(this.chunks[y][x][z]);
    }
    return this.chunks[y][x][z];
  }

  getChunkToRender(x, y, z) {
    //let ce = performance.now()
    let chunk = this.getChunk(x, y, z);
    chunk.neighboors = [
      this.getChunk(x, y, z + 1).getFace(0),
      this.getChunk(x + 1, y, z).getFace(1),
      this.getChunk(x, y + 1, z).getFace(2),
    ];

    return chunk;
    // console.log((performance.now()-ce)/1000)
  }
  getChunkByPos(x, y, z) {
    let chunkPos;
    let blockPos;
    [chunkPos, blockPos] = CoordsToCCoords({ x: x, y: y, z: z });
    return this.getChunk(chunkPos.x, chunkPos.y, chunkPos.z);
  }

  getBlock(x, y, z) {
    let chunkPos;
    let blockPos;
    [chunkPos, blockPos] = CoordsToCCoords({ x: x, y: y, z: z });
    return this.getChunk(chunkPos.x, chunkPos.y, chunkPos.z).getBlock(
      blockPos.x,
      blockPos.y,
      blockPos.z,
    );
  }

  setBlock(x, y, z, id) {
    let chunkPos;
    let blockPos; // let chunkSizeLess = chunkSize-1;
    [chunkPos, blockPos] = CoordsToCCoords({ x: x, y: y, z: z });
    let c = this.getChunk(chunkPos.x, chunkPos.y, chunkPos.z);
    c.setBlock(blockPos.x, blockPos.y, blockPos.z, id);
    if (blockPos.x == 0) {
      let cn = this.getChunk(chunkPos.x - 1, chunkPos.y, chunkPos.z);
      cn.neighboors[1] = c.getFace(1);
      cn.updateMesh();
    }
    if (blockPos.y == 0) {
      let cn = this.getChunk(chunkPos.x, chunkPos.y - 1, chunkPos.z);
      cn.neighboors[2] = c.getFace(2);
      cn.updateMesh();
    }
    if (blockPos.z == 0) {
      let cn = this.getChunk(chunkPos.x, chunkPos.y, chunkPos.z - 1);
      cn.neighboors[0] = c.getFace(0);
      cn.updateMesh();
    }
  }

  genTrees(chunk) {
    //console.log(chunk.position.y)
    if (chunk.empty) return;
    let area = chunkSize - 2;
    let square = 0;
    let corner = 0;
    let threesToPlace = Math.floor(Math.random() * 5);
    for (let t = 0; t < threesToPlace; t++) {
      let x = Math.floor(Math.random() * (chunkSizeThree - 3) + 3);
      let z = Math.floor(Math.random() * (chunkSizeThree - 3) + 3);
      let cx = chunk.position.x * chunkSize + x;
      let cy = chunk.position.y * chunkSize;
      let cz = chunk.position.z * chunkSize + z;
      let treeHeight = 4 + Math.floor(Math.random() * 2);
      let terrainHeight = 32 - Math.floor(this.noise(cx / 128, cz / 128) * 32);
      if (chunk.position > 0) return; // Prevent three on air
      chunk.setBlock(x, terrainHeight - 1, z, 2); //Replace grass by dirt
      chunk.setBlock(x, terrainHeight, z, 3);
      //console.log(x, terrainHeight - 1, z, 2);
      for (let layer = 0; layer < treeHeight + 1; layer++) {
        if (layer < treeHeight) chunk.setBlock(x, terrainHeight + layer, z, 3);
        // Generate Leaves

        if (layer > treeHeight - 4) {
          if (layer < treeHeight - 1) square = 2;
          else square = 1;

          if (layer != treeHeight) corner = 2;
          else corner = 1;

          for (let lx = -square; lx <= square; lx++)
            for (let lz = -square; lz <= square; lz++) {
              if (
                !(
                  (lx == -corner && lz == -corner) ||
                  (lx == corner && lz == corner) ||
                  (lx == -corner && lz == corner) ||
                  (lx == corner && lz == -corner)
                ) &&
                chunk.getBlock(x + lx, terrainHeight + layer, z + lz, 3) == 0
              ) {
                chunk.setBlock(x + lx, terrainHeight + layer, z + lz, 12);
              }
            }
        }
      }
    }
  }
}
