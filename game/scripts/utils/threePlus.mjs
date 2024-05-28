// Additions to Three Js are all worst

import { BufferGeometry, Float32BufferAttribute, Uint32BufferAttribute } from "three";



export class BoxBufferGeometry extends BufferGeometry{
  constructor(width = 1, height = 1, depth = 1, texture, block){
    super();
    this.type = 'BoxBufferGeometry';
    let x = 0; let y = 0; let layer = 0; let vertices = []; let indexes = []; let uvs = []
    for( let dimension = 0; dimension < 3; dimension ++)
    for( let face = 0; face < 2; face ++){
      let vertices_length = vertices.length;
      indexes.push(
        vertices_length, 1 + vertices_length, 2 + vertices_length,
        vertices_length, 2 + vertices_length, 3 + vertices_length,
      );
      let faceTex;
      if (dimension != 2) faceTex = texture.getTextureCoord(block, dimension, face+1)
      else faceTex = texture.getTextureCoord(block, dimension, face)
      uvs.push(
        faceTex[0] * texture.atlasFract.x, faceTex[1] * texture.atlasFract.y,
        faceTex[0] * texture.atlasFract.x, faceTex[1] * texture.atlasFract.y + texture.atlasFract.y,
        faceTex[0] * texture.atlasFract.x + texture.atlasFract.x, faceTex[1] * texture.atlasFract.y +texture.atlasFract.y,
        faceTex[0] * texture.atlasFract.x + texture.atlasFract.x, faceTex[1] * texture.atlasFract.y
      );
      if (dimension == 0) {
        if(face == 1){
          vertices.push(
            {x: x + height, y: y, z: face },
            {x: x + height, y: y + width, z: face},
            {x: x, y: y + width, z: face},
            {x: x, y: y, z: face}
          );
        }else {
          vertices.push(
            {x: x, y: y, z: face},
            {x: x, y: y + width, z: face},
            {x: x + height, y: y + width, z: face},
            {x: x + height, y: y, z: face}
          );
        }
      } else if (dimension == 1) {
        if(face == 1){
          vertices.push(
            {x: face, y: x, z: y},
            {x: face, y: x + height, z: y},
            {x: face, y: x + height, z: y + width},
            {x: face, y: x, z: y + width}
          );
        }else{
          vertices.push(
            {x: face, y: x, z: y + width},
            {x: face, y: x + height, z: y + width},
            {x: face, y: x + height, z: y},
            {x: face, y: x, z: y},
          );
        }
      } else if (dimension == 2) {
        if(face == 0){
          vertices.push(
            {x: x, y: face, z: y + width},
            {x: x, y: face, z: y},
            {x: x + height, y: face, z: y},
            {x: x + height, y: face, z: y + width}
          );
        }else{
          vertices.push(
            {x: x + height, y: face, z: y + width},
            {x: x + height, y: face, z: y},
            {x: x, y: face, z: y},
            {x: x, y: face, z: y + width},
          );
        }
      }
    }

    this.setFromPoints(vertices)
    this.setIndex(new Uint32BufferAttribute(indexes, 1));
    this.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
    //this.setAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );
    this.computeVertexNormals();
  }
}