import Level from "./scripts/world/level";
import { Player } from "./scripts/entities/player";
import { Clock } from "./scripts/utils/clock.mjs";
import { CoordsToCCoords } from "./scripts/utils/coordinates";
import { RenderDistance } from "./scripts/constants";
import { ChatServer } from "./scripts/misc/chat";

var level = new Level();
var clock = new Clock();
var chat = new ChatServer();
var player = new Player("Xt777Br", 0, 50, 0);
var order = BouncingOrder(RenderDistance);
var chunks = [];
var ce = performance.now();

console.log("Server Initialized!");

//setInterval(()=>{postMessage(JSON.parse(JSON.stringify({player:player.data, chunks:shiftMore(chunks), chat:chat.messages})))}, 5)

function update() {
  clock.update();
  player.movement(clock.delta, level);
  player.placeVoxel(level, clock.delta);

  // Chunk List to be Rendered
  let ccpos = CoordsToCCoords(player.data.position)[0];
  if (chunks.length == 0) {
    //console.log((performance.now()-ce)/100)
    //ce = performance.now()
    for (let y of order)
      for (let x of order)
        for (let z of order) {
          let chunk = level.getChunkToRender(
            ccpos.x + x,
            ccpos.y + y,
            ccpos.z + z,
          );
          if (!chunk.empty && !player.chunks.includes(chunk.keyRender)) {
            chunks.push(chunk);
            //console.log(chunk.keyRender);
          }
        }
  }
  //Send to Client
  postMessage(
    JSON.parse(
      JSON.stringify({
        player: player.data,
        chunks: shiftMore(chunks),
        chat: chat.messages,
      }),
    ),
  );
  //console.log(chat.messages)
  requestAnimationFrame(update);
}

onmessage = function (packet) {
  player.update(packet, chat);
  //console.log(packet)
};

function BouncingOrder(RenderDistance = 1) {
  let order = [0];
  for (let i = 1; i <= RenderDistance; i++) order.push(-i, i);
  return order;
}

function shiftMore(arr = []) {
  if (arr.length > 0) {
    let arrr = [];
    for (let maxI = arr.length > 0 ? 1 : arr.length; maxI > 0; maxI--) {
      arrr.push(arr.shift());
    }
    return arrr;
  } else {
    return [];
  }

  if (arr.length > 1) {
    let arrr = [arr.shift(), arr.shift()];

    for (let i = 1; i < 2; i++) {
      arrr.push(arr.shift());
      if (arr.length == 0) break;
    }
    return arrr;
  } else {
    return [arr.shift()];
  }
}

update();
