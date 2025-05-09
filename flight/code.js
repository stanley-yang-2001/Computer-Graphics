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
    // goal, WASD to control camera's position, arrows to control camera's direction
    gl.clear(gl.COLOR_BUFFER_BIT) 
    gl.useProgram(program)        // pick the shaders

    let m = gl.getUniformLocation(program, 'm')
    gl.uniformMatrix4fv(program.uniforms.p, false, p)

    let s = 1
    if (keysBeingPressed['ArrowLeft']){
        dz -=0.01*s
        //console.log("a")
     } else if (keysBeingPressed['ArrowRight']){
         dz +=0.01*s
     }if (keysBeingPressed['ArrowUp']){
        dp -=0.01*s
        //console.log("a")
     } else if (keysBeingPressed['ArrowDown']){
         dp +=0.01*s
     }if (keysBeingPressed['a']){
         dx +=0.05*s
     }else if (keysBeingPressed['d']){
         dx -=0.05*s
     }if (keysBeingPressed['w']){
         dy -=0.05*s
     }else if (keysBeingPressed['s']){
         dy +=0.05*s
     }

    //let rot_mat = matrix.m4rotX(-Math.PI/2)
    //let ma = matrix.m4mul(rot_mat, matrix.m4rotZ(seconds/4),
     //matrix.m4scale(1.5,1.5,1.5), matrix.m4trans(0,0,0))
    /*let ma = matrix.m4mul(matrix.m4rotX(-Math.PI/2),
     matrix.m4scale(1.5,1.5,1.5), matrix.m4trans(0,0,0))*/

    // direction: -x is right, +x is left
    // -z is up, +z is down
    // -y is near, +y is far

    let ma = matrix.m4mul(matrix.m4rotX(-Math.PI),
    matrix.m4scale(1.5,1.5,1.5), matrix.m4trans(0,0,0))

    let forward = [0,1,0]
    let up = [0,0,-1]
    let r = matrix.m4fixAxes(forward, up)
    let right = matrix.normalize(matrix.cross(forward, up))
    let u = matrix.cross(right, matrix.normalize(forward))
    
    let eye_trans = [0+dy*forward[0]+dx*r[0], 
                    4+dy*forward[1]+dx*r[4], 
                    0.5+dy*forward[2]+dx*r[8]]
    let c_z = Math.cos(dz)
    let s_z = Math.sin(dz)

    let c_p = Math.cos(dp)
    let s_p = Math.sin(dp)

    let pitch_R = new Float32Array([right[0]*right[0]*(1-c_p)+c_p, right[0]*right[1]*(1-c_p)+right[2]*s_p, right[0]*right[2]*(1-c_p)-right[1]*s_p,0,
    right[0]*right[1]*(1-c_p)-right[2]*s_p, right[1]*right[1]*(1-c_p)+c_p, right[1]*right[2]*(1-c_p)+right[0]*s_p, 0,
    right[0]*right[2]*(1-c_p)+right[1]*s_p, right[1]*right[2]*(1-c_p)-right[0]*s_p, right[2]*right[2]*(1-c_p)+c_p,0,
    0,0,0,1
    ])
    let pivot_R = new Float32Array([u[0]*u[0]*(1-c_z)+c_z, u[0]*u[1]*(1-c_z)+u[2]*s_z, u[0]*u[2]*(1-c_z)-u[1]*s_z,0,
    u[0]*u[1]*(1-c_z)-u[2]*s_z, u[1]*u[1]*(1-c_z)+c_z, u[1]*u[2]*(1-c_z)+u[0]*s_z, 0,
    u[0]*u[2]*(1-c_z)+u[1]*s_z, u[1]*u[2]*(1-c_z)-u[0]*s_z, u[2]*u[2]*(1-c_z)+c_z,0,
    0,0,0,1
    ])
    //let forward4 = matrix.m4mul(forward_R,[r[2], r[6], r[10], r[14]])
    let new_r = matrix.m4mul(matrix.m4mul(r, pivot_R),pitch_R)


    /*let identity = new Float32Array([1,0,0,0,
                    0,1,0,0,
                    0,0,1,0,
                    0,0,0,1])
    let right_K = new Float32Array([0,r[8], -1*r[4],0,
                                -1*r[8], 0, r[0], 0,
                                r[4], -1*r[0], 0,0,
                                0,0,0,1])*/
    //let s_z = Math.sin(dz)
    //let c_z = Math.cos(dz)
    //let a = matrix.add(identity, matrix.add(matrix.mul(up_K, s_z), matrix.mul(matrix.m4mul(up_K, up_K),(1-c_z))))
    //let right_r = matrix.add(identity, matrix.add(matrix.mul(right_K, s_z), matrix.mul(matrix.m4mul(right_K, right_K),(1-c_z))))
    //let forward_up = matrix.m4mul(right_r, [r[2], r[6], r[10], r[14]])
    /*for (let i = 0; i < forward_up.length; i++){
        console.log(i, " , ",forward_up[i])
    }*/
    
    /*r[2] = forward_up[0]
    r[6] = forward_up[1]

    r[10] = forward_up[2]
    r[14] = forward_up[3]*/
    
    /*console.log("1", r[2])
    console.log("2",r[6])
    console.log("3",r[10])
    console.log("4",r[14])*/
    // original: 0,-1,0,0
    // after: 0,nan,nan,nan




    // -x = right, +x = right
    // -y = near, +y = far
    let eye = new Float32Array([1,0,0,0
                ,0,1,0,0
                ,0,0,1,0
                ,eye_trans[0],eye_trans[1],eye_trans[2],1])
    // forward vector: [0,-1,0]
    // now terrain is at top of camera
    // direction: -x is right, +x is left
    // -y is up, +y is down
    // -z is near, +z is far
    // forward = +y, backward = -y
    // left = -x, right = +x


       
    //let v = matrix.m4view([1+dx,2+dy,4+dz], [0,0,0], [0,1,0])
    //let v = matrix.m4view([1,2,4], [0,0,0], [0,1,0])

    //let v = matrix.m4mul(r,eye)
    let v = matrix.m4mul(new_r,eye)

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
    let gridsize = Math.floor(Math.random()*100)+2
    let faults = Math.floor(Math.random()*150)+20
    window.terrain = setupGeomery(1, -1, gridsize, faults)
    window.dx = 0
    window.dy = 0
    window.dz = 0
    window.dp = 0

    tick(0)

    /*
    tick(0)*/
})

window.keysBeingPressed = {}
window.addEventListener('keydown', event => keysBeingPressed[event.key] = true)
window.addEventListener('keyup', event => keysBeingPressed[event.key] = false)
/*
// evenet listener for button
document.querySelector('#submit').addEventListener('click', event => {
    const gridsize = Number(document.querySelector('#gridsize').value) || 2
    const faults = Number(document.querySelector('#faults').value) || 0
    // TO DO: generate a new gridsize-by-gridsize grid here, then apply faults to it

    // setupGeomery(max, min, grid_size, fault
    window.terrain = setupGeomery(1, -1, gridsize, faults)
})*/
