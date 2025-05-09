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
function setupGeomery(max, min, ring, slices, torus) {
    // a "vertex array object" or VAO records various data provision commands
    var triangleArray = gl.createVertexArray()
    gl.bindVertexArray(triangleArray)
    
    // create float32 array of vertices and color for each vertices
    let origin_vect = [0, min, 0]
    let end_vect = [0,max, 0]
    //let ring = rings
    let layer = []
    let inc = (max-min)/(ring+1)
    let hyp = 1
    
    let ratio = []
    let ring_center = []
    
    //let slices = slices
    let angle_inc = 2*Math.PI/slices
    
    let vertices = []
    let indices_s = []
    let color = new Array()

    // y values
    /*
    for (let i = 0; i < ring; i++){
        layer.push(min+inc*(i+1))
        let angle = Math.asin(layer[i]/hyp)
        let horizontal = hyp*Math.cos(angle)
        ratio.push(horizontal)
        //console.log(layer[i])
    }  */

    // y values

    for (let i = 0; i < ring; i++){
        if (!torus){
            layer.push(min+inc*(i+1))
            let angle = Math.asin(layer[i]/hyp)
            let horizontal = hyp*Math.cos(angle)
            ratio.push(horizontal)
            //console.log(layer[i])
        } else {
            layer.push(0.25*Math.sin((2*Math.PI/ring)*(i+1)))
            console.log(2*Math.PI/ring*(i+1))
            let horizontal = 0.75 + 0.25*Math.cos((2*Math.PI/ring)*(i+1))
            ratio.push(horizontal)
            //console.log("layer:",layer[i])
            //console.log("horizontal: ",horizontal)
        }
    } 


    // vertices
    for (let i = 0; i < layer.length; i++){
        console.log("layer ", layer[i])
        for (let j = 0; j < slices; j++){
            let x = ratio[i]*Math.cos(0+angle_inc*j)
            let z = ratio[i]*Math.sin(0+angle_inc*j)
            vertices.push([x, layer[i], z])
            ring_center.push([0.75*Math.cos(0+angle_inc*j), 0, 0.75*Math.sin(0+angle_inc*j)])
            color.push([255/255, 165/255, 0/255,1])
            //console.log("(", x,",", layer[i], " ,", z, ")")
        }
    }
    /*
    vertices.push(origin_vect)
    vertices.push(end_vect)
    color.push([255/255, 165/255, 0/255,1])
    color.push([255/255, 165/255, 0/255,1])*/

    if (!torus){
        vertices.push(origin_vect)
        vertices.push(end_vect)
    }
    let indice_len = ring -1
    if (torus){
        indice_len = ring
    }

        // indices generation
        /*
    for (let i = 0; i<ring-1; i++){
        for (let j = 0; j < slices; j++){
            if (j % slices == slices-1){
                indices_s.push(i*slices+j, i*slices+j-(slices-1), i*slices+j+slices)
                indices_s.push(i*slices+j-(slices-1), i*slices+j+slices, i*slices+j+1)
                //console.log(i*slices+j, i*slices+j-(slices-1), i*slices+j+slices)
                //console.log(i*slices+j-(slices-1), i*slices+j+slices, i*slices+j+1)
            } else{
                indices_s.push(i*slices+j, i*slices+j+1, i*slices+j+slices)
                indices_s.push(i*slices+j+1, i*slices+j+slices, i*slices+j+slices+1)
                //console.log(i*slices+j, i*slices+j+1, i*slices+j+slices)
                //console.log(i*slices+j+1, i*slices+j+slices, i*slices+j+slices+1)
            }
        }
    }*/

    for (let i = 0; i<indice_len; i++){
        for (let j = 0; j < slices; j++){
            if (torus && i ==ring-1 && j % slices != slices-1){
                indices_s.push(i*slices+j, i*slices+j+1, j)
                indices_s.push(i*slices+j+1, j, j+1)
                //console.log(i*slices+j, i*slices+j+1, j)
                //console.log(i*slices+j+1, j, j+1)
                
            } else if (torus && i ==ring-1 && j % slices == slices-1){
                indices_s.push(i*slices+j, i*slices+j-(slices-1), j)
                indices_s.push(i*slices+j-(slices-1), j, j-j)
                //console.log(i*slices+j, i*slices+j-(slices-1), j)
                //console.log(i*slices+j-(slices-1), j, j-j)
                
            }
            else if (j % slices == slices-1){
                indices_s.push(i*slices+j, i*slices+j-(slices-1), i*slices+j+slices)
                indices_s.push(i*slices+j-(slices-1), i*slices+j+slices, i*slices+j+1)
                //console.log(i*slices+j, i*slices+j-(slices-1), i*slices+j+slices)
                //console.log(i*slices+j-(slices-1), i*slices+j+slices, i*slices+j+1)
            } else{
                indices_s.push(i*slices+j, i*slices+j+1, i*slices+j+slices)
                indices_s.push(i*slices+j+1, i*slices+j+slices, i*slices+j+slices+1)
                //console.log(i*slices+j, i*slices+j+1, i*slices+j+slices)
                //console.log(i*slices+j+1, i*slices+j+slices, i*slices+j+slices+1)
            }
        }
    }


    // indices generation continue (for the two pole)

    if (!torus){
        for (let i = 0; i < 2; i++){
            let pos = vertices.length-2+i
            for (let j = 0; j < slices; j++){
                if(i == 0){
                    if (j == slices-1){
                        indices_s.push(pos, j, j-(slices-1))
                        //console.log(pos, j, j-(slices-1))
                    }else{
                        indices_s.push(pos, j, j+1)
                        //console.log(pos, j, j+1)
                    }
                }else{
                    let curr = vertices.length-2-slices
                    if (j == slices-1){
                        indices_s.push(pos, curr+j, curr+j-(slices-1))
                        //console.log(pos, curr+j, curr+j-(slices-1))
                    }else{
                        indices_s.push(pos, curr+j, curr+j+1)
                        //console.log(pos, curr+j, curr+j+1)
                    }
                }
                
            }
        }
    }


    for (let i = 0; i < vertices.length-color.length+1; i++){
        color.push([255/255, 165/255, 0/255,1])
    }
    console.log("color",color.length)
    console.log("vertices",vertices.length)
    /*
    for (let i = 0; i < 2; i++){
        let pos = vertices.length-2+i
        for (let j = 0; j < slices; j++){
            if(i == 0){
                if (j == slices-1){
                    indices_s.push(pos, j, j-(slices-1))
                    //console.log(pos, j, j-(slices-1))
                }else{
                    indices_s.push(pos, j, j+1)
                    //console.log(pos, j, j+1)
                }
            }else{
                let curr = vertices.length-2-slices
                if (j == slices-1){
                    indices_s.push(pos, curr+j, curr+j-(slices-1))
                    //console.log(pos, curr+j, curr+j-(slices-1))
                }else{
                    indices_s.push(pos, curr+j, curr+j+1)
                    //console.log(pos, curr+j, curr+j+1)
                }
            }
            
        }
    }*/

    let normal_grid = new Array()

    if (!torus){
        for (let i = 0; i < vertices.length; i++){
            console.log(matrix.normalize(vertices[i]))
            normal_grid.push(matrix.normalize(vertices[i]))
        }
    }else{
        for (let i = 0; i < vertices.length; i++){
            console.log("vertices:",vertices[i])
            console.log("center:",ring_center[i])
            //let norm = matrix.sub(ring_center[i],vertices[i])
            let norm = matrix.sub(vertices[i],ring_center[i])
            console.log("norm", norm)
            normal_grid.push(matrix.normalize(norm))
            }

    }



    // sent vertices and color to GPU, choose normal grid instrad of grid
    let buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices.flat()), gl.STATIC_DRAW)


    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(0)

    let buf_color = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf_color)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color.flat()), gl.STATIC_DRAW)
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(1)

    //  normal vector not implemented yet, implement later
    let buf_normal = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf_normal)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normal_grid.flat()), gl.STATIC_DRAW)
    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(2)

    // We also have to explain how values are connected into shapes.
    // There are other ways, but we'll use indices into the other arrays
    var indices = new Uint16Array(indices_s.flat())
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

    let rot_mat = matrix.m4rotY(seconds)
    let ma = matrix.m4mul(rot_mat,
     matrix.m4scale(0.7,0.7,0.7), matrix.m4trans(0,0,0))    
    let v = matrix.m4view([2,2,-3], [0,0,0], [0,1,0])

    gl.uniformMatrix4fv(m, false, matrix.m4mul(v,ma))

    // diffuse and specular light
    let ld = matrix.normalize([1,1,2])
    let h = matrix.normalize(matrix.add(ld, [0,0,1]))
    gl.uniform3fv(program.uniforms.lightdir, ld)
    gl.uniform3fv(program.uniforms.halfway, h)

    //let ld2 = matrix.normalize([-2,-1,1])
    let ld2 = matrix.normalize([0,1,-1])
    let h2 = matrix.normalize(matrix.add(ld2, [0,0,1]))
    gl.uniform3fv(program.uniforms.lightdir2, ld2)
    gl.uniform3fv(program.uniforms.halfway2, h2)



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
    window.terrain = setupGeomery(1, -1, 0, 0, false)
    tick(0)

    /*
    tick(0)*/
})

// evenet listener for button
document.querySelector('#submit').addEventListener('click', event => {
    const rings = Number(document.querySelector('#rings').value) || 2
    const slices = Number(document.querySelector('#slices').value) || 0
    const torus = document.querySelector('#torus').checked
    // TO DO: generate a new gridsize-by-gridsize grid here, then apply faults to it

    // setupGeomery(max, min, grid_size, fault
    window.terrain = setupGeomery(1, -1, rings, slices, torus)
})
