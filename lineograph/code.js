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

function setupGeomery(geom) {
    // a "vertex array object" or VAO records various data provision commands
    var triangleArray = gl.createVertexArray()
    gl.bindVertexArray(triangleArray)
    
    // loop over every attribute
    for(let i=0; i<geom.attributes.length; i+=1) {
        // goal 1: get data from CPU memory to GPU memory 
        // createBuffer allocates an array of GPU memory
        let buf = gl.createBuffer()
        // to get data into the array we tell the GPU which buffer to use
        gl.bindBuffer(gl.ARRAY_BUFFER, buf)
        // and convert the data to a known fixed-sized type
        let f32 = new Float32Array(geom.attributes[i].flat())
        // then send that data to the GPU, with a hint that we don't plan to change it very often
        gl.bufferData(gl.ARRAY_BUFFER, f32, gl.STATIC_DRAW)
        
        // goal 2: connect the buffer to an input of the vertex shader
        // inputs are numbered in the vertex shader to equal i here
        // telling the GPU how to parse the bytes of the array:
        gl.vertexAttribPointer(i, geom.attributes[i][0].length, gl.FLOAT, false, 0, 0)
        // and connecting the currently-used array to the VS input
        gl.enableVertexAttribArray(i)
    }

    // We also have to explain how values are connected into shapes.
    // There are other ways, but we'll use indices into the other arrays
    var indices = new Uint16Array(geom.indice.flat())
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
    //gl.clear(gl.COLOR_BUFFER_BIT) 
    gl.useProgram(program)        // pick the shaders

    // problem: distorted view, shape is stretched to correspond to ratio of canvas

    let m = gl.getUniformLocation(program, 'm')

    // variable setup
    let s = 1.4
    // x: left to right axis
    // y: top to bottom axis
    // z: near(+) and far(-) axis, adjusted based on current view
    if (keysBeingPressed['q']){
       dz -=0.05*s
    } else if (keysBeingPressed['e']){
        dz +=0.05*s
    }else if (keysBeingPressed['a']){
        dx -=0.05*s
    }else if (keysBeingPressed['d']){
        dx +=0.05*s
    }else if (keysBeingPressed['w']){
        dy +=0.05*s
    }else if (keysBeingPressed['s']){
        dy -=0.05*s
    }
    let mat = new Float32Array([1, 0, 0, 0
                            ,0, 1, 0, 0
                            ,0,0,1,0
                            ,dx,dy,dz,4])
    let sun = new Float32Array([1, 0, 0, 0
                                ,0, 1, 0, 0
                                ,0, 0, 1, 0
                                ,0, 0, 0, 1])
    let v = matrix.m4view([1,2,3], [0,0,0], [0,1,0])
    gl.uniformMatrix4fv(program.uniforms.p, false, p)

    gl.uniformMatrix4fv(m, false, matrix.m4mul(v,mat))
    //gl.uniformMatrix4fv(m, false, mat)
    gl.bindVertexArray(octa.vao)  // and the buffers
    gl.drawElements(octa.mode, octa.count, octa.type, 0) // then draw things



    if (keysBeingPressed['q']){
        console.log("q")
    }



}


function tick(milliseconds) {
    const seconds = milliseconds / 1000
    draw(seconds)
    requestAnimationFrame(tick) // <- only call this here, nowhere else
}

function m4perspNegZ(near, far, fovy, width, height){
    let sy = 1/Math.tan(fovy/2);
    let sx = sy*height/width;
    return new Float32Array([sx,0,0,0, 0,sy,0,0, 0,0,-(far+near)/(far-near),-1, 0,0,(2*far*near)/(near-far),0]);
  }

function fillScreen() {
    let canvas = document.querySelector('canvas')
    document.body.style.margin = '0'
    canvas.style.width = '100vw'
    canvas.style.height = '100vh'
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight
    canvas.style.width = ''
    canvas.style.height = ''
    if (window.gl) {
        gl.viewport(0,0, canvas.width, canvas.height)
        window.p = m4perspNegZ(0.1, 10, 1.5, canvas.width, canvas.height)
    }
}

window.addEventListener('load', async (event) => {
    window.gl = document.querySelector('canvas').getContext('webgl2',{preserveDrawingBuffer:true})
    //window.gl = document.querySelector('canvas').getContext('webgl2')
    let vs = await fetch('vertex.glsl').then(res => res.text())
    let fs = await fetch('fragment.glsl').then(res => res.text())
    window.program = compileShader(vs,fs)
    gl.enable(gl.DEPTH_TEST)

    let octahedron = await fetch('octahedron.json').then(r=>r.json())
    window.octa = setupGeomery(octahedron)

    fillScreen()
    window.addEventListener('resize', fillScreen)
    window.dx = 0
    window.dy = 0
    window.dz = 0
    gl.clear(gl.COLOR_BUFFER_BIT) 

    tick(0)
    //tick()
})

window.keysBeingPressed = {}
window.addEventListener('keydown', event => keysBeingPressed[event.key] = true)
window.addEventListener('keyup', event => keysBeingPressed[event.key] = false)
