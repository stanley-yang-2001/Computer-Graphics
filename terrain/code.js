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
    let color = new Array()

    for (let i = 0; i < grid_size; i++){
        for (let j = 0; j<grid_size; j++){
            grid.push([min+inc*i,min+inc*j,0])
            console.log([min+inc*i,min+inc*j,0])
            color.push([247/255, 212/255, 129/255,1])
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

    let buf_color = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf_color)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color.flat()), gl.STATIC_DRAW)
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(1)

    let buf_normal = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf_normal)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normal_grid.flat()), gl.STATIC_DRAW)
    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(2)

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

function draw(seconds) {
    gl.clear(gl.COLOR_BUFFER_BIT) 
    gl.useProgram(program)        // pick the shaders

    let m = gl.getUniformLocation(program, 'm')
    gl.uniformMatrix4fv(program.uniforms.p, false, p)

    let rot_mat = matrix.m4rotX(-Math.PI/2)
    let ma = matrix.m4mul(rot_mat, matrix.m4rotZ(seconds/4),
     matrix.m4scale(1.5,1.5,1.5), matrix.m4trans(0,0,0))    
    let v = matrix.m4view([2,2,-3], [0,0,0], [0,1,0])

    gl.uniformMatrix4fv(m, false, matrix.m4mul(v,ma))

    // diffuse and specular light
    let ld = matrix.normalize([1,1,2])
    let h = matrix.normalize(matrix.add(ld, [0,0,1]))
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
    let vs = await fetch('vertex.glsl').then(res => res.text())
    let fs = await fetch('fragment.glsl').then(res => res.text())
    window.program = compileShader(vs,fs)
    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    fillScreen()
    window.addEventListener('resize', fillScreen)
    window.terrain = setupGeomery(1, -1, 0, 0)
    tick(0)

    /*
    tick(0)*/
})

// evenet listener for button
document.querySelector('#submit').addEventListener('click', event => {
    const gridsize = Number(document.querySelector('#gridsize').value) || 2
    const faults = Number(document.querySelector('#faults').value) || 0
    // TO DO: generate a new gridsize-by-gridsize grid here, then apply faults to it

    // setupGeomery(max, min, grid_size, fault
    window.terrain = setupGeomery(1, -1, gridsize, faults)
})
