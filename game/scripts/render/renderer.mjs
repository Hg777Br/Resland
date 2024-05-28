import { WebGLRenderer, ACESFilmicToneMapping } from "three"

export default class Renderer {
  constructor() {
    console.log("Initializing Renderer")
    this.renderer = new WebGLRenderer({antialias: false})
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera = null;
    document.body.appendChild(this.renderer.domElement);
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.5;
  }
  render(scene) {
    this.renderer.render(scene, this.camera)
  }
}