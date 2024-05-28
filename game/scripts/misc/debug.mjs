const RenderDistance = 2

export class RunTimer {
    constructor(f = Function, args = [], kwargs = {}){
        this.init = performance.now();
        f(args);
        console.log("Executed in",(performance.now() - this.init)/1000, "ms.");
    }
}

function on_render_distance(pos){
    var out_x_p = 0-pos.x > RenderDistance
    var out_y_p = 0-pos.y > RenderDistance
    var out_z_p = 0-pos.z > RenderDistance
    var out_x_n = 0-pos.x < -RenderDistance
    var out_y_n = 0-pos.y < -RenderDistance
    var out_z_n = 0-pos.z < -RenderDistance
    console.log(Math.abs(0-pos.y)>RenderDistance || Math.abs(0-pos.y)>RenderDistance || Math.abs(0-pos.z)>RenderDistance)
}

on_render_distance({x: 2, y: 2, z: -2})