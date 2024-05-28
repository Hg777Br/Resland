// Resland | Coded by Hugo Gabriel O. 2023
// Inspired on posts of mikolalysenko, it's made from zero using his code like a reference to make my own!
// Status: Work In Progress
import { chunkSize, chunkSizeQuad } from "../constants";

const faces = [
  3, 1, 4.5, 4.5, 4, 2
]


function Mesher(chunk, neighboorsChunks, blocks, mode = "fast") {

  function getFaceID(mask, dimension) {
    return (mask - 1) + 2 * dimension;
  }
  function getTextureCoord(block, faceID) {
    //console.log(block)
    return blocks[block - 1][faceID];
  }
  function getBlockDimension(d, l, x, y) {
    if (d == 0) return chunk[y * chunkSizeQuad + x * chunkSize + l]
    else if (d == 1) return chunk[x * chunkSizeQuad + l * chunkSize + y]
    return chunk[l * chunkSizeQuad + x * chunkSize + y]
  }
  function getBlockDimensionNe(d, l, x, y) {
    if (d == 0) return neighboorsChunks[0][x * chunkSize + y]
    else if (d == 1) return neighboorsChunks[1][x * chunkSize + y]
    return neighboorsChunks[2][x * chunkSize + y]
  }
  // Interact With each dimension
  // Z = 0, X = 1, Y = 2
  let indexes = [];
  let uvs = [];
  let vertices = [];
  let sizes = [];

  for (let dimension = 0; dimension < 3; dimension++) {
    for (let layer = 0; layer < chunkSize; layer++) {
      let mask = new Uint8Array(chunkSizeQuad); let mask_index = 0;
      for (let x = 0; x < chunkSize; x++) {
        for (let y = 0; y < chunkSize; y++) {
          if (layer < 0) { mask[mask_index] = getBlockDimension(dimension, 0, x, y) != 0; }
          else if (layer != chunkSize - 1) {
            mask[mask_index] = (getBlockDimension(dimension, layer, x, y) != 0) + 2 * (getBlockDimension(dimension, layer + 1, x, y) != 0);
            if (mask[mask_index] == 3) mask[mask_index] = 0;
          }
          else { mask[mask_index] = (getBlockDimension(dimension, layer, x, y) != 0) + 2 * (getBlockDimensionNe(dimension, layer, x, y) != 0); if (mask[mask_index] == 3) mask[mask_index] = 0; }
          mask_index++;
        }
      }
      // Greedy Meshing
      mask_index = 0; // Reset to zero
      for (let x = 0; x < chunkSize; x++) {
        for (let y = 0; y < chunkSize;) {
          if (mask[mask_index] > 0) {
            let width = 1; let width2 = 0; let height = 1;
            if (layer == chunkSize - 1) {
              var block = mask[mask_index] > 1 ? getBlockDimensionNe(dimension, layer, x, y) : getBlockDimension(dimension, layer, x, y);
            } else {
              var block = getBlockDimension(dimension, layer * (layer > 0) + 1 * (mask[mask_index] > 1), x, y);
            }

            if (true) {
              for (width = 1; mask[mask_index + width] == mask[mask_index] && y + width < chunkSize && getBlockDimension(dimension, layer * (layer > 0) + 1 * (mask[mask_index + width] > 1), x, y + width) == block; width++) { }
              for (height = 1; x + height < chunkSize;) {
                if (mask[mask_index + (height * chunkSize)] == mask[mask_index] && mask[mask_index + (height * chunkSize) + (width - 1)] == mask[mask_index]) {
                  for (width2 = 0; mask[(mask_index + (height * chunkSize)) + width2] == mask[mask_index] && y + width2 < chunkSize && getBlockDimension(dimension, layer * (layer > 0) + 1 * (mask[(mask_index + (height * chunkSize)) + width2] > 1), x + height, y + width2) == block; width2++) { }
                  if (width == width2) height++; else break;
                  if (x + height == chunkSize - 1) height = (chunkSize - 1) - x;
                } else break;
              }
            }
            let vertices_length = vertices.length;
            indexes.push(
              vertices_length, 1 + vertices_length, 2 + vertices_length,
              vertices_length, 2 + vertices_length, 3 + vertices_length,
            );
            let face = getFaceID(mask[mask_index], dimension);
            let texCoords = getTextureCoord(block, face);
            face = faces[face];
            uvs.push(0, 0, face, 0, 1, face, 1, 1, face, 1, 0, face)
            if (dimension == 0) {
              if (mask[mask_index] == 1) {
                vertices.push(
                  { x: x + height, y: y, z: layer + 1 },
                  { x: x + height, y: y + width, z: layer + 1 },
                  { x: x, y: y + width, z: layer + 1 },
                  { x: x, y: y, z: layer + 1 }
                );
              } else {
                vertices.push(
                  { x: x, y: y, z: layer + 1 },
                  { x: x, y: y + width, z: layer + 1 },
                  { x: x + height, y: y + width, z: layer + 1 },
                  { x: x + height, y: y, z: layer + 1 }
                );
              }


              sizes.push(
                height, width, ...texCoords,
                height, width, ...texCoords,
                height, width, ...texCoords,
                height, width, ...texCoords
              );

            } else if (dimension == 1) {
              if (mask[mask_index] == 1) {
                vertices.push(
                  { x: layer + 1, y: x, z: y },
                  { x: layer + 1, y: x + height, z: y },
                  { x: layer + 1, y: x + height, z: y + width },
                  { x: layer + 1, y: x, z: y + width }
                );
              } else {
                vertices.push(
                  { x: layer + 1, y: x, z: y + width },
                  { x: layer + 1, y: x + height, z: y + width },
                  { x: layer + 1, y: x + height, z: y },
                  { x: layer + 1, y: x, z: y },
                );
              }

              sizes.push(
                width, height, ...texCoords,
                width, height, ...texCoords,
                width, height, ...texCoords,
                width, height, ...texCoords
              );

            } else if (dimension == 2) {
              if (mask[mask_index] == 2) {
                vertices.push(
                  { x: x, y: layer + 1, z: y + width },
                  { x: x, y: layer + 1, z: y },
                  { x: x + height, y: layer + 1, z: y },
                  { x: x + height, y: layer + 1, z: y + width }
                );
              } else {
                vertices.push(
                  { x: x + height, y: layer + 1, z: y + width },
                  { x: x + height, y: layer + 1, z: y },
                  { x: x, y: layer + 1, z: y },
                  { x: x, y: layer + 1, z: y + width },
                );
              }
              sizes.push(
                height, width, ...texCoords,
                height, width, ...texCoords,
                height, width, ...texCoords,
                height, width, ...texCoords
              );
            }
            //Remove used masks
            for (let m_x = 0; m_x < height; m_x++)
              for (let m_y = 0; m_y < width; m_y++) { mask[mask_index + m_y + (m_x * chunkSize)] = false; }
            mask_index += width;
            y += width;
          } else { mask_index++; y++; }
        }
      }
    }
  }
  return [vertices, indexes, uvs, sizes]
}

onmessage = function(e) {
  //console.log(e)
  postMessage([...Mesher(e.data[0], e.data[1], e.data[2]), e.data[4]])
}

