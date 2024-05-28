import { uuidV4 } from "../utils/uuid"


export class Entity {
    constructor(){
        this.id = uuidV4()
        this.name = ""
        this.health = 10
        this.damage = 0
        this.position = {x:0, y:0, z:0}
        this.rotation = {x:0, y:0, z:0}
    }
}