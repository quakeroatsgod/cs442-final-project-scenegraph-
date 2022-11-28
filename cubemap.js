//Code attributed from learnopengl.com/cubemap
//Class to create a cubemap, which is the skybox that surrounds the world.
//It looks and feels similar to a mesh object
const SKYBOX_VERTEX_STRIDE=12;
class Cubemap{
    /**
     * 
     * @param {*} gl 
     * @param {*} shader_program 
     * @param {String[]} tex 
     * @param {*} vertices 
     */
    constructor(gl,program,tex, vertices){
        this.verts = create_and_load_vertex_buffer( gl, vertices, gl.STATIC_DRAW );
        this.n_verts = vertices.length;
        this.program=program;
        this.texture=[];
        var image= new Array(6);
        for(let i=0; i<6; i++){
            //Texture stuff
            let texture=gl.createTexture();
            image[i] = new Image();
            image[i].src=tex[i];
            //Image asynchronous callback function upon loading image
            image[i].onload=function(){
                gl.bindTexture(gl.TEXTURE_CUBE_MAP,texture);
                for(let x=0; x<6; x++){
                    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + x, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image[x]);            
                    //Enable mipmapping
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

                }
                gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
            }
            this.texture=texture;
        }
        
    }
    static createCubemap(gl, program, tex){
        let verts=[];
        verts = [
        -1000.0,  1000.0, -1000.0,
        -1000.0, -1000.0, -1000.0,
        1000.0, -1000.0, -1000.0,
        1000.0, -1000.0, -1000.0,
        1000.0,  1000.0, -1000.0,
        -1000.0,  1000.0, -1000.0,

        -1000.0, -1000.0,  1000.0,
        -1000.0, -1000.0, -1000.0,
        -1000.0,  1000.0, -1000.0,
        -1000.0,  1000.0, -1000.0,
        -1000.0,  1000.0,  1000.0,
        -1000.0, -1000.0,  1000.0,

        1000.0, -1000.0, -1000.0,
        1000.0, -1000.0,  1000.0,
        1000.0,  1000.0,  1000.0,
        1000.0,  1000.0,  1000.0,
        1000.0,  1000.0, -1000.0,
        1000.0, -1000.0, -1000.0,

        -1000.0, -1000.0,  1000.0,
        -1000.0,  1000.0,  1000.0,
        1000.0,  1000.0,  1000.0,
        1000.0,  1000.0,  1000.0,
        1000.0, -1000.0,  1000.0,
        -1000.0, -1000.0,  1000.0,

        -1000.0,  1000.0, -1000.0,
        1000.0,  1000.0, -1000.0,
        1000.0,  1000.0,  1000.0,
        1000.0,  1000.0,  1000.0,
        -1000.0,  1000.0,  1000.0,
        -1000.0,  1000.0, -1000.0,

        -1000.0, -1000.0, -1000.0,
        -1000.0, -1000.0,  1000.0,
        1000.0, -1000.0, -1000.0,
        1000.0, -1000.0, -1000.0,
        -1000.0, -1000.0,  1000.0,
        1000.0, -1000.0,  1000.0
        ];
        
        return new Cubemap(gl,program,tex,verts);
    }
    render(gl){
        // console.log(this.program ===null)
        gl.useProgram(this.program);
        set_vertex_attrib_to_buffer( 
            gl, this.program, 
            "sky_coords", 
            this.verts, 3, 
            gl.FLOAT, false, SKYBOX_VERTEX_STRIDE, 0 
        );
        bind_texture_samplers( gl, this.program, "skybox" ,0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.verts);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP,this.texture);
        gl.activeTexture( gl.TEXTURE0 );

        

        gl.drawArrays(gl.TRIANGLES, 0, 36);

    }
}

/**
 * XORs the gray-scale values along a square. Called in createBindXORTexture()
 * @returns Uint8Array that contains the values of each pixel in a 256x256 texture
 */
function generateXORTexture(){
    let data = new Array(256*256*4);
    let width=256;
    for( let row = 0; row < width; row++ ) {
        for( let col = 0; col < width; col++ ) {
            //Get pixel at some point
            let pix = ( row * width + col ) * 4;
            //The actual XOR'ing
            data[pix] = data[pix + 1] = data[pix + 2] = row ^ col;
            //Alpha set to max
            data[pix + 3] = 255;
        }
    }
    return new Uint8Array(data);
}

function createBindXORCubemap(gl){
    let tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP,tex);
    for(let x=0; x<6; x++){
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + x,0,gl.RGBA,256,256,0,gl.RGBA,gl.UNSIGNED_BYTE,generateXORTexture());
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    //Enable mipmapping
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    return tex;
}
