import * as matrix from "./math.js"

function compileShader(vs_source, fs_source) {
    const vs = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vs, vs_source)
    gl.compileShader(vs)
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(vs))
        throw Error("Vertex shader compilation failed")
    }

    const fs = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(fs, fs_source)
    gl.compileShader(fs)
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(fs))
        throw Error("Fragment shader compilation failed")
    }

    const program = gl.createProgram()
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program))
        throw Error("Linking failed")
    }
    const uniforms = {}
    for(let i=0; i<gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS); i+=1) {
        let info = gl.getActiveUniform(program, i)
        uniforms[info.name] = gl.getUniformLocation(program, info.name)
    }
    program.uniforms = uniforms

    return program
}

// square grid and fault implementation
function setupGeomery(max, min, grid_size, fault) {
    // a "vertex array object" or VAO records various data provision commands
    var triangleArray = gl.createVertexArray()
    gl.bindVertexArray(triangleArray)
    
    // create float32 array of vertices and color for each vertices
    let inc = (max-min)/(grid_size-1)
    let grid = new Array()

    let texInc = 1/(grid_size-1)
    let texCoordBufferData = new Array()
    //let color = new Array()

    for (let i = 0; i < grid_size; i++){
        for (let j = 0; j<grid_size; j++){
            grid.push([min+inc*i,min+inc*j,0])
            texCoordBufferData.push([texInc*i, texInc*j])
            //color.push([247/255, 212/255, 129/255,1])
        }  
    }
    // fault method and prepare for height normalization
    let height_max = -1000
    let height_min = 1000
    for (let i =0; i<fault; i++){
        let p = [Math.random() * (max - min) + min, Math.random() * (max - min) + min]
        let n = [Math.cos(Math.random()*2*Math.PI), Math.sin(Math.random()*2*Math.PI), 0]
        for (let j = 0; j < grid.length; j++){
            let result = matrix.dot(matrix.sub(grid[j].slice(0,2),p), n)
            if (result<=0){
                grid[j][2] -=0.5
            } else {
                grid[j][2] +=0.5
            }
            if (grid[j][2] > height_max){
                height_max = grid[j][2]
            } 
            if(grid[j][2] < height_min){
                height_min = grid[j][2]
            }
        }
    }
    
    // normalize height
    for (let j = 0; j < grid.length; j++){
        let c = 1.2
        let normal_height = c * (grid[j][2]-0.5*(height_max+height_min))/(height_max-height_min)
        grid[j][2] = normal_height
    }
    let normal_grid = new Array()
    // grid normalization
    for (let i = 0; i < grid.length; i++){
        let n,s,w,e;
        // north
        if (i < grid_size){
            n = grid[i]
        } else{
            n = grid[i-grid_size]
        }
        // south
        if (i > (grid_size-1)*grid_size -1){
            s = grid[i]
        } else{
            s = grid[i+grid_size]
        }
        
        // west
        if (i % grid_size == 0){
            w = grid[i]
        } else{
            w = grid[i-1]
        }
        // east
        if (i % grid_size == grid_size-1){
            e = grid[i]
        } else{
            e = grid[i+1]
        }

        let normal_vec = matrix.cross(matrix.sub(n,s), matrix.sub(w,e))
        normal_grid.push(matrix.normalize(normal_vec))
    }


    // create the indices
    let indices_triangle = new Array()
    for (let i =0; i < grid_size-1; i++ ){
        for (let j = 0; j < grid_size-1; j++){
            indices_triangle.push(i*grid_size+j, i*grid_size+j+1, i*grid_size+j+grid_size)
            indices_triangle.push(i*grid_size+j+1, i*grid_size+j+grid_size, i*grid_size+j+grid_size+1)
        }
    }

    // sent vertices and color to GPU, choose normal grid instrad of grid
    let buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(grid.flat()), gl.STATIC_DRAW)

    //let l = normal_grid[0].length
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(0)

    /*let buf_color = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf_color)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color.flat()), gl.STATIC_DRAW)
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(1)*/

    let buf_normal = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf_normal)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normal_grid.flat()), gl.STATIC_DRAW)
    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(2)

    // texture coordinate to GPU
    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoordBufferData.flat()), gl.STATIC_DRAW)
    gl.vertexAttribPointer(3,2,gl.FLOAT, false, 0,0,)
    gl.enableVertexAttribArray(3)

    // We also have to explain how values are connected into shapes.
    // There are other ways, but we'll use indices into the other arrays
    var indices = new Uint16Array(indices_triangle.flat())
    // we'll need a GPU array for the indices too
    var indexBuffer = gl.createBuffer()
    // but the GPU puts it in a different "ready" position, one for indices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

    // we return all the bits we'll need to use this work later
    return {
        mode:gl.TRIANGLES,      // grab 3 indices per triangle
        count:indices.length,   // out of this many indices overall
        type:gl.UNSIGNED_SHORT, // each index is stored as a Uint16
        vao:triangleArray       // and this VAO knows which buffers to use
    }
}

function draw(seconds,option) {
    gl.clear(gl.COLOR_BUFFER_BIT) 
    gl.useProgram(program)        // pick the shaders

    //let color_option = new Float32Array([1.0,1.0,1.0,0.3])
    /*
    if (option == 1){
        let r = Number('0x' + window.hex.substr(1,2))
        let g = Number('0x' + window.hex.substr(3,2))
        let b = Number('0x' + window.hex.substr(5,2))
        let a = Number('0x' + window.hex.substr(7,2))
        color_option = new Float32Array([r/255,g/255,b/255,a/255])


    }*/
    //console.log(color_option)
    let m = gl.getUniformLocation(program, 'm')
    gl.uniformMatrix4fv(program.uniforms.p, false, p)
    gl.uniform4fv(program.uniforms.color, window.color)

    let rot_mat = matrix.m4rotX(-Math.PI/2)
    let ma = matrix.m4mul(rot_mat, matrix.m4rotZ(seconds/2),
     matrix.m4scale(1.5,1.5,1.5), matrix.m4trans(0,0,0))    
    let v = matrix.m4view([2,2,-3], [0,0,0], [0,1,0])

    gl.uniformMatrix4fv(m, false, matrix.m4mul(v,ma))

    // diffuse and specular light
    let ld = matrix.normalize([1,1,2])
    let h_eye = matrix.m4mul(v,ma)
    let h = matrix.normalize(matrix.add(ld, h_eye))
    gl.uniform3fv(program.uniforms.lightdir, ld)
    gl.uniform3fv(program.uniforms.halfway, h)



    gl.bindVertexArray(terrain.vao)  // and the buffers
    gl.drawElements(terrain.mode, terrain.count, terrain.type, 0) // then draw things
    //console.log("drawing")




}


function tick(milliseconds) {
    const seconds = milliseconds / 1000
    draw(seconds)
    requestAnimationFrame(tick) // <- only call this here, nowhere else
}

function fillScreen() {
    let canvas = document.querySelector('canvas')
    document.body.style.margin = '0'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight
    canvas.style.width = ''
    canvas.style.height = ''
    gl.viewport(0,0, canvas.width, canvas.height)
    // TO DO: compute a new projection matrix based on the width/height aspect ratio
    window.p = matrix.m4perspNegZ(0.1, 15, 0.7, canvas.width, canvas.height)
}


window.addEventListener('load', async (event) => {
    window.gl = document.querySelector('canvas').getContext('webgl2')
    let vs1 = 'non_texture_vs.glsl'
    let fs1 = 'non_texture_fs.glsl'
    let vs2 = 'texture_vs.glsl'
    let fs2 = 'texture_fs.glsl'
    
    window.vs1 = await fetch(vs1).then(res => res.text())
    window.fs1 = await fetch(fs1).then(res => res.text())
    window.vs2 = await fetch(vs2).then(res => res.text())
    window.fs2 = await fetch(fs2).then(res => res.text())
    window.program = compileShader(window.vs1,window.fs1)
    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    fillScreen()
    window.addEventListener('resize', fillScreen)
    window.color = new Float32Array([1.0,1.0,1.0,0.3])
    window.option=0

    window.terrain = setupGeomery(1, -1, 0, 0)
    tick(0)

    /*
    tick(0)*/
})

// evenet listener for button
document.querySelector('#submit').addEventListener('click', event => {
    const gridsize = Number(document.querySelector('#gridsize').value) || 2
    const faults = Number(document.querySelector('#faults').value) || 0
    console.log(1)
    console.log(window.option)
    let vs, fs;
    if (window.option ==0){
        window.color = new Float32Array([1.0,1.0,1.0,0.3])
        vs = window.vs1
        fs = window.fs1
    }else if (window.option==1){
        let r = Number('0x' + window.hex.substr(1,2))
        let g = Number('0x' + window.hex.substr(3,2))
        let b = Number('0x' + window.hex.substr(5,2))
        let a = Number('0x' + window.hex.substr(7,2))
        window.color = new Float32Array([r/255,g/255,b/255,a/255])
        vs = window.vs1
        fs = window.fs1
    } else if (window.option==2){
        window.color = new Float32Array([1.0,0.0,1.0,0.0])
        vs = window.vs1
        fs = window.fs1
    } else if (window.option==3){
        vs = window.vs2
        fs = window.fs2

    }

    window.program = compileShader(vs,fs)
    window.terrain = setupGeomery(1, -1, gridsize, faults)
})

// evenet listener for change in text
document.querySelector('#text').addEventListener('change', event => {
    const text = String(document.querySelector('#text').value) || ''
    console.log(text)
    if(text==''){                   // space
        console.log("space")
        window.vs = 'non_texture_vs.glsl'
        window.fs = 'non_texture_fs.glsl'
        window.option=0
    } else if (/^#[0-9a-f]{8}$/i.test(text)){   // hex
        console.log("hex code")
        window.vs = 'non_texture_vs.glsl'
        window.fs = 'non_texture_fs.glsl'
        window.hex = text
        window.option=1
    }else if (/[.](jpg|png)$/.test(text)){      // image url
        let img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = text;
        img.addEventListener('error', event =>{     // loading failed
            window.vs = 'non_texture_vs.glsl'
            window.fs = 'non_texture_fs.glsl'
            window.option = 2
            console.log("error")
        })
        img.addEventListener('load', event=>{       // loading successful
            window.option = 3
            console.log("success")
            window.vs = 'texture_vs.glsl'
            window.fs = 'texture_fs.glsl'
            let slot = 0; 
            let texture = gl.createTexture();
            gl.activeTexture(gl.TEXTURE0 + slot);
            gl.bindTexture(gl.TEXTURE_2D, texture);


            // set up parameter
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

            // send pixel data to GPU
            gl.texImage2D(
                gl.TEXTURE_2D, // destination slot
                0, // the mipmap level this data provides; almost always 0
                gl.RGBA, // how to store it in graphics memory
                gl.RGBA, // how it is stored in the image object
                gl.UNSIGNED_BYTE, // size of a single pixel-color in HTML
                img, // source data
            );
            //gl.generateMipmap(gl.TEXTURE_2D);
            gl.uniform1i(program.uniforms.image, slot)
        })
        console.log("url")
    }
})
