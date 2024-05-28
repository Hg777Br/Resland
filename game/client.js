import * as THREE from "three";
import { FirstPersonController } from "./scripts/controls/playerClient.js";
import { TextureBlockAtlas } from "./textures/texture.js";
import chunkShader from "./scripts/render/shaders/chunkShader.js";
import { Sky } from "./scripts/world/sky.mjs";
import { Clock } from "./scripts/utils/clock.mjs";
import Renderer from "./scripts/render/renderer.mjs";
import Stats from "three/examples/jsm/libs/stats.module";
import { CoordsToCCoords } from "./scripts/utils/coordinates.js";
import { chunkSize, RenderDistance } from "./scripts/constants.js";
import { ChatClient } from "./scripts/misc/chat.js";

// Start Threads

const debug = Stats();
document.getElementById("debug").append(debug.dom);
const debugCoord = [
  document.getElementById("coordX"),
  document.getElementById("coordY"),
  document.getElementById("coordZ"),
];
const healthBar = document.getElementById("healthBar");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xafb1ad);
scene.fog = new THREE.Fog(scene.background, 0.01, 42);
scene.add(new THREE.HemisphereLight(0xffffff, 0x000000, 0.5));
const sky = new Sky();
sky.scale.setScalar(450000);
const sun = new THREE.DirectionalLight(0xafb1ad, 10);
const theta = THREE.MathUtils.degToRad(180);
const texLoader = new THREE.TextureLoader();
const textureAtlas = texLoader.load("/game/textures/map.png");
const textureAtlas2 = texLoader.load("/game/textures/mapp.png");
textureAtlas2.magFilter = THREE.NearestFilter;
textureAtlas2.minFilter = THREE.NearestFilter;
textureAtlas2.colorSpace = THREE.SRGBColorSpace;
const texBreaking = texLoader.load("/game/textures/breaking.png");
texBreaking.magFilter = THREE.NearestFilter;
const texture = new TextureBlockAtlas(
  textureAtlas,
  "/game/textures/map.png",
  16,
  256,
  48,
);

const blockHold = new THREE.Mesh(
  new THREE.BufferGeometry(),
  new THREE.MeshLambertMaterial({
    map: textureAtlas,
    depthWrite: false,
    dephTest: false,
  }),
);
blockHold.position.set(3, -1.7, -2);
blockHold.rotation.set(0, -40, -0.1);
blockHold.renderOrder = 1;
blockHold.onBeforeRender = (renderer) => {
  renderer.clearDepth();
};
const renderer = new Renderer();
const player = new FirstPersonController(renderer, "Xt777Br");
const clock = new Clock();
const meshWorker = new Worker("./game/scripts/render/meshing.mjs", {
  type: "module",
});
const server = new Worker("./game/server.js", { type: "module" });
const block_material = new THREE.ShaderMaterial({
  vertexShader: chunkShader.vert,
  fragmentShader: chunkShader.frag,
  uniforms: {
    atlas: { type: "t", value: texture.atlas },
    atlasFract: { type: "v2", value: texture.atlasFract },
    fogColor: { type: "c", value: scene.fog.color },
    fogNear: { type: "f", value: scene.fog.near },
    fogFar: { type: "f", value: scene.fog.far },
    sun: { type: "f", value: 0 },
  },
  precision: "highp",
  fog: true,
});

const chat = new ChatClient(player);

const placeBlockOut = new THREE.LineSegments(
  new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)),
  new THREE.LineBasicMaterial({ color: 0x777777, linewidth: 5 }),
);

const placeBlock = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({
    map: texBreaking,
    transparent: true,
    depthTest: false,
  }),
);

var time = 0;
var chunks = {};
var ref = new THREE.Mesh(
  new THREE.BoxGeometry(),
  new THREE.MeshBasicMaterial(),
);

//blockHold.position.set(0, 35, 0)
scene.add(sky);
scene.add(sun);
player.camera.add(blockHold);
scene.add(player.camera);
scene.add(placeBlockOut);

var maxChunks = 0;
var chunkDebug = debug.addPanel(
  new Stats.Panel("Chunks Rendered", "#ff7700", "#632e00"),
);
//debug.showPanel(0)

window.addEventListener(
  "resize",
  (e) => {
    player.camera.aspect = window.innerWidth / window.innerHeight;
    player.camera.updateProjectionMatrix();
    renderer.renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene);
  },
  false,
);

setInterval(() => {
  server.postMessage(
    JSON.parse(
      JSON.stringify({
        player: player,
        start: new THREE.Vector3().setFromMatrixPosition(
          player.camera.matrixWorld,
        ),
        end: new THREE.Vector3(0, 0, 1).unproject(player.camera),
        chunks: Object.keys(chunks).map((key) => chunks[key].keyRender),
      }),
    ),
  );
}, 50);

server.onmessage = function (packet) {
  player.data = packet.data.player;
  let cchunks = packet.data.chunks;
  chat.messages = packet.data.chat;
  for (let chunk of cchunks) {
    if (!Object.hasOwn(chunks, chunk.id)) chunks[chunk.id] = chunk;
    else if (
      Object.hasOwn(chunks, chunk.id) &&
      chunks[chunk.id].keyRender != chunk.keyRender
    ) {
      chunks[chunk.id] = chunk;
      console.log("epa", chunks[chunk.id].needRender);
    }
  }
};

meshWorker.onmessage = function (e) {
  //console.log(e.data)
  let mesh = scene.getObjectByName(e.data[4]);
  if (!mesh) {
    mesh = new THREE.Mesh(new THREE.BufferGeometry(), block_material);
    mesh.name = e.data[4];
    scene.add(mesh);
  } else {
    //console.log(chunks[e.data[4]].blocks)
  }
  mesh.geometry.setFromPoints(e.data[0]);
  mesh.geometry.setIndex(new THREE.Uint16BufferAttribute(e.data[1], 1));
  mesh.geometry.setAttribute(
    "a_uv",
    new THREE.Uint8BufferAttribute(e.data[2], 3),
  );
  mesh.geometry.setAttribute(
    "size",
    new THREE.Uint8BufferAttribute(e.data[3], 4),
  );
  mesh.geometry.computeBoundingSphere();
  mesh.position
    .set(
      chunks[e.data[4]].position.x,
      chunks[e.data[4]].position.y,
      chunks[e.data[4]].position.z,
    )
    .multiplyScalar(chunkSize);
  chunks[e.data[4]].needRender = false;
};

function update() {
  //time += clock.delta * 2;
  //time %= 360;
  sun.position.setFromSphericalCoords(
    15,
    THREE.MathUtils.degToRad(time),
    theta,
  );
  let lenChunks = Object.keys(chunks).length;
  if (maxChunks < lenChunks) chunkDebug.update(lenChunks, maxChunks);
  debug.update();
  debugCoord[0].innerHTML = Math.floor(player.data.position.x);
  debugCoord[1].innerHTML = Math.floor(player.data.position.y);
  debugCoord[2].innerHTML = Math.floor(player.data.position.z);
  healthBar.style.width =
    ((player.data.health / player.data.max_health) * 100).toString() + "%";
  clock.update();
  sky.position.set(
    player.data.position.x,
    player.data.position.y,
    player.data.position.z,
  );
  player.renderHotbar(blockHold, texture);
  player.camera.position
    .copy(player.data.position)
    .add(new THREE.Vector3(0, player.holdKeys.crounch ? 1.3 : 1.7, 0));
  block_material.wireframe = player.debug.wireframe;
  block_material.uniforms["atlas"].value = player.debug.mc
    ? textureAtlas2
    : textureAtlas;
  //server.postMessage(JSON.parse(JSON.stringify({player:player, start:new THREE.Vector3().setFromMatrixPosition( player.camera.matrixWorld ), end: new THREE.Vector3(0, 0, 1).unproject(player.camera)})))

  requestAnimationFrame(update);
  render();
}

function render() {
  sky.material.uniforms["sunPosition"].value.copy(sun.position);
  block_material.uniforms["sun"].value = (time / 180) * Math.PI;
  let fogColor = scene.background;
  scene.fog = new THREE.Fog(
    fogColor.lerpColors(
      scene.background,
      new THREE.Color(0xeeaa88),
      time / 180,
    ),
    scene.fog.near,
    RenderDistance * 16,
  );
  renderer.render(scene);
  placeBlockOut.position.copy(player.data.out);
  player.camera.fov = player.holdKeys.zoom ? 10 : 95;
  player.camera.updateProjectionMatrix();

  for (let chunkKey of Object.keys(chunks)) {
    let chunk = chunks[chunkKey];
    let ccpos = CoordsToCCoords(player.data.position)[0];
    if (
      Math.abs(ccpos.x - chunk.position.x) > RenderDistance ||
      Math.abs(ccpos.y - chunk.position.y) > RenderDistance ||
      Math.abs(ccpos.z - chunk.position.z) > RenderDistance
    ) {
      scene.remove(scene.getObjectByName(chunk.id));
      delete chunks[chunkKey];
    } else if (chunks[chunkKey].needRender) {
      //console.log(chunks[chunkKey].needRender)
      chunks[chunkKey].needRender = false;
      meshWorker.postMessage([
        chunk.blocks,
        chunk.neighboors,
        texture.blocks,
        "fast",
        chunk.id,
      ]);
    }
  }
}

update();
