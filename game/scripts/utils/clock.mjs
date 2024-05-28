export class Clock {
  constructor(){
    this.delta = 0;
    this.lastTime = 0;
  }
  update(){
    let currentTime = ( typeof performance === 'undefined' ? Date : performance ).now() / 1000;
    this.delta = currentTime - this.lastTime;
    this.lastTime = currentTime;
  }
  getFPS(){
    return 1 / this.delta;
  }
}