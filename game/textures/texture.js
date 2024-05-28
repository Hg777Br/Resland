import {Vector2, TextureLoader, MeshLambertMaterial, DoubleSide, NearestFilter, SRGBColorSpace } from "three"

class TextureBlockAtlas{
    constructor(Texture = TextureLoader, atlasImage = "", tileSize = 16, width = 64, height = 48){
        //Setup Variables for Chunk Renderer
        this.tileSize = tileSize;
        this.atlasWidth = width;
        this.atlasHeight = height;
        this.atlasFract = new Vector2(tileSize / width, tileSize / height);
        //Load Atlas Texture
        this.atlas = Texture;
        this.atlasImage = atlasImage;
        //Fix Atlas Blurry Texture
        this.atlas.magFilter = NearestFilter;
	    this.atlas.minFilter = NearestFilter;
	    this.atlas.colorSpace = SRGBColorSpace;
        this.blocks = [
            [[0,2],[0,2],[0,2],[0,2],[1,2],[2,2]], // grass
            [[2,2],[2,2],[2,2],[2,2],[2,2],[2,2]], // dirt
            [[2,1],[2,1],[2,1],[2,1],[3,1],[3,1]], // log
            [[3,2],[3,2],[3,2],[3,2],[3,2],[3,2]], // stone
            [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]], // coal
            [[2,0],[2,0],[2,0],[2,0],[2,0],[2,0]], // copper
            [[1,0],[1,0],[1,0],[1,0],[1,0],[1,0]], // iron
            [[0,1],[0,1],[0,1],[0,1],[0,1],[0,1]], // wood
            [[1,1],[1,1],[1,1],[1,1],[1,1],[1,1]], // bricks
            [[3,0],[3,0],[3,0],[3,0],[3,0],[3,0]], // gold
            [[4,2],[4,2],[4,2],[4,2],[4,2],[4,2]], // sand
            [[4,1],[4,1],[4,1],[4,1],[4,1],[4,1]], // leaf
            [[5,1],[5,1],[5,1],[5,1],[5,1],[5,1]], // stone bricks
            [[5,2],[5,2],[5,2],[5,2],[5,2],[5,2]], // water
        ]
    }

    getTextureCoord(block, dimension, mask){
        //console.log(block)
        return this.blocks[block][(mask-1) + 2*dimension];
    }
}

export {TextureBlockAtlas}