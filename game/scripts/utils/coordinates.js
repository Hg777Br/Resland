import { chunkSize } from "../constants"

export function CCoordsToCoords(chunk_pos = {x: 0, y: 0, z:0}, block_pos = {x: 0, y: 0, z:0}){
    let coordinates = {
        x: chunk_pos.x * chunkSize + block_pos.x,
        y: chunk_pos.y * chunkSize + block_pos.y,
        z: chunk_pos.z * chunkSize + block_pos.z,
    }
    return coordinates
}

export function CoordsToCCoords(coordinates = {x: 0, y: 0, z:0}){
    let chunk_coordinates = {
        x: Math.floor(coordinates.x / chunkSize),
        y: Math.floor(coordinates.y / chunkSize),
        z: Math.floor(coordinates.z / chunkSize),
    }
    let block_coordinates = {
        x: Math.floor(coordinates.x % chunkSize) >= 0 ? Math.floor(coordinates.x % chunkSize) : chunkSize + Math.floor(coordinates.x % chunkSize),
        y: Math.floor(coordinates.y % chunkSize) >= 0 ? Math.floor(coordinates.y % chunkSize) : chunkSize + Math.floor(coordinates.y % chunkSize),
        z: Math.floor(coordinates.z % chunkSize) >= 0 ? Math.floor(coordinates.z % chunkSize) : chunkSize + Math.floor(coordinates.z % chunkSize),
    }
    return [chunk_coordinates, block_coordinates]
}