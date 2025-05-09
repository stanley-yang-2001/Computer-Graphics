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
function addNormals(geom) {
    let ni = geom.attributes.length
    geom.attributes.push([])
    for(let i = 0; i < geom.attributes[0].length; i+=1) {
        geom.attributes[ni].push([0,0,0])
    }
    for(let i = 0; i < geom.triangles.length; i+=1) {
        let p0 = geom.attributes[0][geom.triangles[i][0]]
        let p1 = geom.attributes[0][geom.triangles[i][1]]
        let p2 = geom.attributes[0][geom.triangles[i][2]]

        geom.attributes[ni][geom.triangles[i][0]] = matrix.add(geom.attributes[ni][geom.triangles[i][0]], p0)
        geom.attributes[ni][geom.triangles[i][1]] = matrix.add(geom.attributes[ni][geom.triangles[i][1]], p1)
        geom.attributes[ni][geom.triangles[i][2]] = matrix.add(geom.attributes[ni][geom.triangles[i][2]], p2)
    }
    for(let i = 0; i < geom.attributes[0].length; i+=1) {
        geom.attributes[ni][i] = matrix.normalize(geom.attributes[ni][i])
    }
}

function supplyDataBuffer(data, loc, mode) {
    if (mode === undefined) mode = gl.STATIC_DRAW
    
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    const f32 = new Float32Array(data.flat())
    gl.bufferData(gl.ARRAY_BUFFER, f32, mode)
    
    gl.vertexAttribPointer(loc, data[0].length, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(loc)
    
    return buf;
}
// square grid and fault implementation
function setupGeomery(geom) {
    var sphereArray = gl.createVertexArray()
    gl.bindVertexArray(sphereArray)

    for(let i=0; i<geom.attributes.length; i+=1) {
        let data = geom.attributes[i]
        supplyDataBuffer(data, i)
    }

    var indices = new Uint16Array(geom.triangles.flat())
    var indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)


    return {
        mode: gl.TRIANGLES,
        count: indices.length,
        type: gl.UNSIGNED_SHORT,
        vao: sphereArray
    }
}

function draw(seconds) {
    gl.clear(gl.COLOR_BUFFER_BIT) 
    gl.useProgram(program)        // pick the shaders

    let m = gl.getUniformLocation(program, 'm')
    gl.uniformMatrix4fv(program.uniforms.p, false, p)

    let rot_mat = matrix.m4rotX(-Math.PI/2)
    let s = 1
    if (keysBeingPressed['q']){
        dz -=0.1*s
        //console.log("a")
     } else if (keysBeingPressed['e']){
         dz +=0.1*s
     }if (keysBeingPressed['a']){
         dx -=0.05*s
     }else if (keysBeingPressed['d']){
         dx +=0.05*s
     }if (keysBeingPressed['w']){
         dy -=0.05*s
     }else if (keysBeingPressed['s']){
         dy +=0.05*s
     }
     
    //let v = matrix.m4view([0,3,-8], [0,0,0], [0,1,0])
    //console.log([dx,dy,dz])
    //let v = matrix.m4view([dx,dy,dz], [0,0,0], [0,1,0])
    let v = matrix.m4view([0.5,3.7,-18], [0,0,0], [0,1,0])

    let gravity = [0,-9.8,0]
    // diffuse and specular light
    let ld = matrix.normalize([1,3.7,-10])
    let h = matrix.normalize(matrix.add(ld, [0,0,1]))
    gl.uniform3fv(program.uniforms.lightdir, ld)
    gl.uniform3fv(program.uniforms.halfway, h)
    let xmax = 2.0
    let xmin = -2.0
    let ymin = -2.00
    let ymax = 2.50
    let zmin = -2.00
    let zmax = 2.00
    let elas = 0.9
     // radius is 0.5, not scaled yet
     // sphere diameter should be 0.15 * cube width, original diameter is 2, radius is 1,
    let scale = 0.15*(xmax-xmin)/1.76
    //let scale = 0.15*4.0
    let radius = scale/1.2
    for (let i = 0; i < window.position.length; i++){
        let pos = position[i]
        let vel = velocity[i]
        //console.log(i)
        let ma = matrix.m4mul(
        matrix.m4trans(pos[0],pos[1], pos[2]),matrix.m4scale(scale,scale,scale))
        //gl.clear(gl.COLOR_BUFFER_BIT)
        //console.log("i ", i, " ",window.color[i])
        gl.uniform4fv(program.uniforms.color, new Float32Array(window.color[i].flat()))
        //gl.uniform4fv(program.uniforms.color, new Float32Array([255,0,0,1]))
        gl.uniformMatrix4fv(program.uniforms.p, false, p)
        gl.uniformMatrix4fv(m, false, matrix.m4mul(v,ma))
        gl.uniform3fv(program.uniforms.lightdir, ld)
        gl.uniform3fv(program.uniforms.halfway, h)

        gl.bindVertexArray(geom.vao)
        gl.drawElements(geom.mode, geom.count, geom.type, 0) // then draw things

        // new position and velocity
        //console.log("vel at start ", vel)
        if (isNaN(vel[0])){
            console.log("i ", i)
            throw new Error("Value is NaN.");
        }
        let pos_new = matrix.add(pos,matrix.mul(vel,(seconds-window.time[i])))
        let vel_new = matrix.add(vel,matrix.mul(gravity,(seconds-window.time[i])))
        
        if (pos_new[0]+radius > xmax){
            vel_new[0] *=-0.9
            pos_new[0] = xmax - radius
        } else if (pos_new[0]-radius < xmin){
            vel_new[0] *=-0.9
            pos_new[0] = xmin + radius
        }

        if (pos_new[1]-radius < ymin){
            vel_new[1] *=-0.9
            pos_new[1] = ymin + radius
        }
        else if (pos_new[1]+radius > ymax){
            vel_new[1] *=-0.9
            pos_new[1] = ymax - radius
        } 
        if (pos_new[2]-radius < zmin){
            vel_new[2] *=-0.9
            pos_new[2] = zmin + radius
        }
        else if (pos_new[2]+radius > zmax){
            vel_new[2] *=-0.9
            pos_new[2] = zmax - radius
        }
        //console.log("vel after detect hit wall ", vel)
        // length = 2, max i = 1
        // let i = 0, then 1-0-1 = 0, j range from 0 - 0
        // 0+0+1= 1, 0+1+1 = 2, 0+2+1 = 3, 0+3+1 = 4
        //console.log("position ",position)
        //console.log("i ", i)
        //console.log("position.length ", position.length)
        
        for (let j = i+1; j < position.length; j++){
            //console.log("collision detecting")
            //console.log("j: ",j)
            //console.log("velocity j: ",velocity[j])
            let xi = position[j][0]-pos[0]
            let yi = position[j][1]-pos[1]
            let zi = position[j][2]-pos[2]
            let subtract = matrix.sub(position[j], pos)
            let dist = matrix.mag(subtract)
            //console.log("pos j",position[j])
            //console.log("pos",pos)
            //console.log("subtract: ",subtract)
            //let dist = Math.sqrt(xi*xi+yi*yi+zi*zi)
            if (dist<2*radius){
                //console.log("collision detected")
                //let d = matrix.div(matrix.sub(position[j], pos),dist)
                let d = matrix.normalize(subtract)
                //console.log("new_vel: ", vel_new)
                //console.log("d: ", d)
                let si = matrix.dot(vel_new, d)
                let sj = matrix.dot(velocity[j], d)
                /*if (isNaN(sj)){
                    console.log("sj ",sj)
                    console.log("velocity[j] ", velocity[j])
                    console.log(velocity)
                    throw new Error("Value is NaN.");
                }
                if (isNaN(velocity[j][0])){
                    console.log("sj ",sj)
                    console.log("velocity[j] ", velocity[j])
                    console.log(velocity)
                    throw new Error("Value is NaN.");
                }
                console.log("si ",si)
                console.log("sj ",sj)
                console.log("velocity[j] ", velocity[j])*/
                let s = si-sj
                //console.log(s)
                if (s > 0){
                    // all sphere's mass is equal, so their weight is 0.5
                    //console.log("adjust vel")
                    //console.log("d ", d)
                    let factor = s*0.5*(1.0+elas)
                    //console.log("Factor: ",factor)
                    vel_new = matrix.add(vel_new,matrix.mul(d,-1*factor))
                    pos_new = matrix.add(pos_new,matrix.mul(vel_new,(seconds-window.time[i])))
                    //console.log(vel_new)

                    
                    //console.log("new vel ", vel_new)
                    //console.log("velocity j before adding ", velocity[j])
                    velocity[j] = matrix.add(velocity[j],matrix.mul(d,factor))
                    //console.log("velocity j at end: ",velocity[j])
                }

            }
        }
        window.position[i] = pos_new
        window.velocity[i] = vel_new
        //console.log(pos, "+ ",vel, "* ", seconds-window.time[i], "=", pos_new)
        //console.log("vel at end :",vel_new)
        window.time[i] = seconds
        

        //console.log(window.position[i])
    }

}


function tick(milliseconds) {
    if (!startTime){
        startTime = milliseconds
    }
    //const seconds = milliseconds / 1000
    let seconds = (milliseconds - startTime) / 1000
    //console.log(seconds)
    if (seconds >= 15){
        startTime = milliseconds;
        seconds = 0;
        setProperties(50,2,-2)
        //console.log("times up")
    }
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
    window.p = matrix.m4perspNegZ(0.1, 100, 0.5, canvas.width, canvas.height)
}


window.addEventListener('load', async (event) => {
    window.gl = document.querySelector('canvas').getContext('webgl2')
    setProperties(50, 2, -2)
    let vs = await fetch('vertex.glsl').then(res => res.text())
    let fs = await fetch('fragment.glsl').then(res => res.text())
    window.program = compileShader(vs,fs)
    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    let sphere = await fetch('sphere.json').then(res => res.json())
    addNormals(sphere)
    fillScreen()
    window.addEventListener('resize', fillScreen)
    window.geom = setupGeomery(sphere)
    window.startTime = null;
    //tick(0)
    requestAnimationFrame(tick)

    /*
    tick(0)*/
})
function setProperties(balls, maximum, minimum){
    window.color = []
    let ball = balls
    for (let i = 0; i < ball; i++){
        window.color.push([Math.random(),Math.random(),Math.random(),1.0 ])
    }
    //console.log(window.color)
    //window.dx = 0
    //window.dy = 0
    window.dz = 0
    window.position = []
    window.velocity = new Array()
    window.time = []
    let max = maximum
    let min = minimum
    // position set to random coordinate, velocity set randomly at start
    for (let i = 0; i < ball; i++){
        //console.log(" start ",velocity)
        let p1 = Math.random()*(2*max) +min 
        let p2 = Math.random()*(max+1) +(min*0.5) 
        let p3 = Math.random()*(2*max) +min 
        let v1 = (Math.random()*(2*max) +min)*0.001 
        let v2 = (Math.random()*(2*max) +min) *0.001
        let v3 = (Math.random()*(2*max) +min )*0.001
        let pos = [p1, p2,p3]
        let vel = [v1,v2,v3]
        //let vel = [i,i,i]
        //position.push([Math.random()*((max-min)+min), Math.random()*((max-min)+min), Math.random()*((max-min)+min)])
        window.velocity.push(vel)
        position.push(pos)
        time.push(0)
    }

    //window.velocity = test
    //console.log("velocity now: ", velocity)
    //console.log("position now: ", position)

}
// evenet listener for button
/*
document.querySelector('#submit').addEventListener('click', event => {
    const gridsize = Number(document.querySelector('#gridsize').value) || 2
    const faults = Number(document.querySelector('#faults').value) || 0
    // TO DO: generate a new gridsize-by-gridsize grid here, then apply faults to it

    // setupGeomery(max, min, grid_size, fault
    window.terrain = setupGeomery(1, -1, gridsize, faults)
})*/

window.keysBeingPressed = {}
window.addEventListener('keydown', event => keysBeingPressed[event.key] = true)
window.addEventListener('keyup', event => keysBeingPressed[event.key] = false)