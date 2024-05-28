import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import { PerspectiveCamera, Vector3, BufferAttribute } from "three";
import { BoxBufferGeometry } from "../utils/threePlus.mjs";

const menuPanel = document.getElementById("menu");
const startButton = document.getElementById("return");
const chat = document.getElementById("messages");

class FirstPersonController {
  constructor(renderer, name) {
    this.name = name;
    this.data = {
      health: 0,
      max_health: 0,
      position: new Vector3(22, 48, 20),
      out: new Vector3(0, 0, 0),
      messagesQueue: [],
      yvelocity: 0,
      placeDelay: 0,
      forceDelayReset: false,
    };
    this.block = 0;
    this.uiIndex = 0;
    this.hotBar = [1, 2, 4, 11, 3, 12, 8, 9, 13];
    this.hotBarIndex = 0;
    this.camera = new PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      2000,
    );
    this.camera.position.set(
      this.data.position.x,
      this.data.position.y + 1.7,
      this.data.position.z,
    );
    this.pointer = new PointerLockControls(
      this.camera,
      renderer.renderer.domElement,
    );
    this.speed = 7.5;
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
      zoom: false,
    };
    this.blockHoldPos = new Vector3(3, -1.7, -2);

    this.debug = {
      wireframe: false,
      mesh_mode: false,
      coordinates: false,
      mc: false,
    };
    this.isPaused = true;

    this.footStep = 0;
    renderer.camera = this.camera;

    // Resgister Input Events
    startButton.addEventListener(
      "click",
      (e) => {
        this.pointer.lock();
      },
      false,
    );
    this.pointer.addEventListener("lock", (e) => {
      this.isPaused = false;
      menuPanel.style.display = "none";
    });
    this.pointer.addEventListener("unlock", (e) => {
      this.isPaused = true;
      menuPanel.style.display = "block";
    });
    window.addEventListener("keydown", (event) =>
      this.keyboardInput(event, true),
    );
    window.addEventListener("keyup", (event) =>
      this.keyboardInput(event, false),
    );
    window.addEventListener("mousedown", (event) =>
      this.mouseInput(event, true),
    );
    window.addEventListener("mouseup", (event) =>
      this.mouseInput(event, false),
    );
    window.addEventListener("wheel", (event) => this.wheelInput(event));
    window.addEventListener(
      "contextmenu",
      (e) => e?.cancelable && e.preventDefault(),
    );
  }
  keyboardInput(key, value = Boolean) {
    //console.log(key)

    switch (key.code) {
      case "KeyW":
        this.holdKeys.forward = value;
        break;
      case "KeyA":
        this.holdKeys.left = value;
        key.preventDefault();
        break;
      case "KeyS":
        this.holdKeys.backward = value;
        key.preventDefault();
        break;
      case "KeyD":
        this.holdKeys.right = value;
        key.preventDefault();
        break;
      case "ShiftLeft":
      case "ShiftRight":
        this.holdKeys.sprint = value;
        break;
      case "AltLeft":
      case "AltRight":
        this.holdKeys.crounch = value;
        key.preventDefault();
        break;
      case "Space":
        this.holdKeys.jump = value;
        break;
      case "KeyJ":
        if (value) this.debug.wireframe = !this.debug.wireframe;
        break;
      case "KeyK":
        if (value) this.debug.mesh_mode = !this.debug.mesh_mode;
        break;
      case "KeyM":
        if (value) this.debug.mc = !this.debug.mc;
        break;
      case "KeyC":
        if (value) this.holdKeys.zoom = !this.holdKeys.zoom;
        break;
      case "KeyT":
        if (value && !this.isPaused) this.uiIndex = this.uiIndex < 2 ? 2 : 1;
      case "Digit1":
      case "Digit2":
      case "Digit3":
      case "Digit4":
      case "Digit5":
      case "Digit6":
      case "Digit7":
      case "Digit8":
      case "Digit9":
        if (value) this.hotBarIndex = parseInt(key.key) - 1;
        break;
    }
  }
  mouseInput(e, value = Boolean) {
    if (e.which === 1 || e.button === 0) {
      this.holdKeys.breaking = value;
      if (this.data.placeDelay > 0) {
        this.data.forceDelayReset = true;
        console.log("place delay reset");
      }
    }
    if (e.which === 2 || e.button === 1) {
    }
    if (e.which === 3 || e.button === 2) {
      this.holdKeys.placing = value;
      if (this.data.placeDelay > 0) {
        this.data.forceDelayReset = true;
        console.log("place delay reset");
      }
    }
  }

  wheelInput(e) {
    if (this.isPaused) return;
    //e.preventDefault();
    this.hotBarIndex = Math.floor(this.hotBarIndex + e.deltaY * -0.01);
    if (this.hotBarIndex > 8) this.hotBarIndex = 0;
    else if (this.hotBarIndex < 0) this.hotBarIndex = 8;
    //console.log(this.hotBarIndex)
  }

  renderHotbar(blockHold, texture) {
    blockHold.position.y = this.blockHoldPos.y + this.data.yvelocity * -0.01;
    blockHold.rotation.x = -this.data.placeDelay * 2;
    if (this.block == this.hotBar[this.hotBarIndex]) return;
    this.block = this.hotBar[this.hotBarIndex];

    blockHold.geometry = new BoxBufferGeometry(
      1,
      1,
      1,
      texture,
      this.block - 1,
    );
    //console.log(blockHold)
    var active = document.getElementsByClassName("hotbarhoveractive");
    for (let index = 0; active.length > index; index++) {
      active[index].className = "hotbarhover";
    }

    if (this.uiIndex == 2) {
      chat.style.display = "block";
    } else {
      chat.style.display = "none";
    }

    document.getElementById("hotbarhover" + (this.hotBarIndex + 1)).className =
      "hotbarhoveractive";
  }
}

export { FirstPersonController };
