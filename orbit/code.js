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
    gl.clear(gl.COLOR_BUFFER_BIT) 
    gl.useProgram(program)        // pick the shaders

    // problem: distorted view, shape is stretched to correspond to ratio of canvas

    let m = gl.getUniformLocation(program, 'm')

    // rotating in z axis (camera view,/our view, rotate around)
    let rotation_sun = seconds*Math.PI

    // sun, fixed at origin, full rotation at 2 second
    let sun = new Float32Array([Math.cos(rotation_sun), 0, -1*Math.sin(rotation_sun), 0
                                ,0, 1, 0, 0
                                ,Math.sin(rotation_sun), 0, Math.cos(rotation_sun), 0
                                ,0, 0, 0, 1.4])
    let v = matrix.m4view([3,1,3], [0,0,0], [0,1,0])
    gl.uniformMatrix4fv(program.uniforms.p, false, p)

    gl.uniformMatrix4fv(m, false, matrix.m4mul(v,sun))
    gl.bindVertexArray(octa.vao)  // and the buffers
    gl.drawElements(octa.mode, octa.count, octa.type, 0) // then draw things

    // Earth, spin like sun several time a second and rotate the sun every few second
    let rotation_earth = seconds*Math.PI*2

    let earth = matrix.m4mul(matrix.m4rotY(seconds*0.8),matrix.m4rotZ(0.21),
                    matrix.m4trans(1.8,0,0), matrix.m4scale(0.35,0.35,0.35), matrix.m4rotY(rotation_earth))

    gl.uniformMatrix4fv(m, false, matrix.m4mul(v,earth))
    gl.bindVertexArray(octa.vao)  // and the buffers
    gl.drawElements(octa.mode, octa.count, octa.type, 0) // then draw things


    // Moon, smaller than Earth, orbit Earth's speed: faster than Earth orbits Sun but slower than it spin
    // always present its same side to Earth
    let orbit_moon = (rotation_earth-seconds*0.8)*0.2 + seconds*0.8
    let moon = matrix.m4mul(earth,matrix.m4rotY(orbit_moon), matrix.m4trans(1.5,-0.1,0), 
                            matrix.m4scale(0.2,0.2,0.2))
    /*let moon = matrix.m4mul(earth,matrix.m4rotY(orbit_moon), matrix.m4trans(1.5,-0.1,0), 
                            matrix.m4scale(0.2,0.2,0.2)) */

    gl.uniformMatrix4fv(m, false, matrix.m4mul(v,moon))
    gl.bindVertexArray(tetra.vao)  // and the buffers
    gl.drawElements(tetra.mode, tetra.count, tetra.type, 0) // then draw things




    // Mar, little smaller than Earth, 1.6 times as far from Sun as Earth, 
    // orbits the sun 1.9 time slower as Earth, spin 2.2 times slower than Earth 

    let rotation_mar = rotation_earth/2.2
    /*let mar = matrix.m4mul(matrix.m4rotY(seconds*0.8/1.9), matrix.m4trans(1.8*1.6,0,0), 
                    matrix.m4scale(0.3,0.3,0.3), 
                    matrix.m4rotZ(-0.37),matrix.m4rotY(rotation_mar))*/

    let mar = matrix.m4mul(matrix.m4rotY(seconds*0.8/1.9),
                    matrix.m4trans(1.8*1.6,0,0), matrix.m4scale(0.3,0.3,0.3),
                    matrix.m4rotY(rotation_mar))


    gl.uniformMatrix4fv(m, false, matrix.m4mul(v,mar))
    gl.bindVertexArray(octa.vao)  // and the buffers
    gl.drawElements(octa.mode, octa.count, octa.type, 0) // then draw things


    // Phobos, smaller than Mars, orbit Mars several times faster than it spins
    // always present its same side to Mars
    let orbit_Phobes = rotation_mar*3.1415926535
    let phobes = matrix.m4mul(mar,matrix.m4rotY(orbit_Phobes), matrix.m4trans(1.5,0,0), 
                            matrix.m4scale(0.2,0.2,0.2))

    gl.uniformMatrix4fv(m, false, matrix.m4mul(v,phobes))
    gl.bindVertexArray(tetra.vao)  // and the buffers
    gl.drawElements(tetra.mode, tetra.count, tetra.type, 0) // then draw things

    // Deimos, twice as far from Mars as Phobos, orbit Mars a little faster
    // always present its same side to Mars
    let orbit_Deimos = rotation_mar*1.42
    let deimos = matrix.m4mul(mar,matrix.m4rotY(orbit_Deimos), matrix.m4trans(1.5*2,0,0), 
                            matrix.m4scale(0.1,0.1,0.1))

    gl.uniformMatrix4fv(m, false, matrix.m4mul(v,deimos))
    gl.bindVertexArray(tetra.vao)  // and the buffers
    gl.drawElements(tetra.mode, tetra.count, tetra.type, 0) // then draw things



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
    window.gl = document.querySelector('canvas').getContext('webgl2')
    let vs = await fetch('vertex.glsl').then(res => res.text())
    let fs = await fetch('fragment.glsl').then(res => res.text())
    window.program = compileShader(vs,fs)
    gl.enable(gl.DEPTH_TEST)

    let tetrahedron = await fetch('tetrahedron.json').then(r=>r.json())
    window.tetra = setupGeomery(tetrahedron)

    let octahedron = await fetch('octahedron.json').then(r=>r.json())
    window.octa = setupGeomery(octahedron)

    fillScreen()
    window.addEventListener('resize', fillScreen)

    tick(0)
})
