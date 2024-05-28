import { Vector3 } from "three";

export function CheckCollision(playerPOS = Vector3, level, direction) {
  var height = 1.7; var widthDistance = 0.25;
  var Points = [
    [playerPOS.x + widthDistance, playerPOS.y, playerPOS.z + widthDistance],
    [playerPOS.x + widthDistance, playerPOS.y, playerPOS.z - widthDistance],
    [playerPOS.x - widthDistance, playerPOS.y, playerPOS.z + widthDistance],
    [playerPOS.x - widthDistance, playerPOS.y, playerPOS.z - widthDistance],
    [playerPOS.x + widthDistance, playerPOS.y + height / 2, playerPOS.z + widthDistance],
    [playerPOS.x + widthDistance, playerPOS.y + height / 2, playerPOS.z - widthDistance],
    [playerPOS.x - widthDistance, playerPOS.y + height / 2, playerPOS.z + widthDistance],
    [playerPOS.x - widthDistance, playerPOS.y + height / 2, playerPOS.z - widthDistance],
    [playerPOS.x + widthDistance, playerPOS.y + height, playerPOS.z + widthDistance],
    [playerPOS.x + widthDistance, playerPOS.y + height, playerPOS.z - widthDistance],
    [playerPOS.x - widthDistance, playerPOS.y + height, playerPOS.z + widthDistance],
    [playerPOS.x - widthDistance, playerPOS.y + height, playerPOS.z - widthDistance]
  ];
  for (var point in Points) {
    Points[point] = Points[point].map((a, i) => Math.floor(a + direction[i]));
    if (level.getBlock(Points[point][0], Points[point][1], Points[point][2]) != 0) return false;
  }
  return true;
}

export function CheckCollisionInBlock(playerPOS = Vector3, block = []) {
  var height = 1.7; var widthDistance = 0.25;
  var Points = [
    [playerPOS.x + widthDistance, playerPOS.y, playerPOS.z + widthDistance],
    [playerPOS.x + widthDistance, playerPOS.y, playerPOS.z - widthDistance],
    [playerPOS.x - widthDistance, playerPOS.y, playerPOS.z + widthDistance],
    [playerPOS.x - widthDistance, playerPOS.y, playerPOS.z - widthDistance],
    [playerPOS.x + widthDistance, playerPOS.y + height / 2, playerPOS.z + widthDistance],
    [playerPOS.x + widthDistance, playerPOS.y + height / 2, playerPOS.z - widthDistance],
    [playerPOS.x - widthDistance, playerPOS.y + height / 2, playerPOS.z + widthDistance],
    [playerPOS.x - widthDistance, playerPOS.y + height / 2, playerPOS.z - widthDistance],
    [playerPOS.x + widthDistance, playerPOS.y + height, playerPOS.z + widthDistance],
    [playerPOS.x + widthDistance, playerPOS.y + height, playerPOS.z - widthDistance],
    [playerPOS.x - widthDistance, playerPOS.y + height, playerPOS.z + widthDistance],
    [playerPOS.x - widthDistance, playerPOS.y + height, playerPOS.z - widthDistance]
  ];
  for (var point in Points) {
    Points[point] = Points[point].map((a, i) => Math.floor(a));
    console.log(block[0] == Points[point][0] , block[1] == Points[point][1] , block[2] == Points[point][2] )
    if (block[0] == Points[point][0] && block[1] == Points[point][1] && block[2] == Points[point][2] ) return false;
  }
  return true;
}