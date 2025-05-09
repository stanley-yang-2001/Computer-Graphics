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
function setupGeomery() {
    var sphereArray = gl.createVertexArray()
    gl.bindVertexArray(sphereArray)

    /*for(let i=0; i<geom.attributes.length; i+=1) {
        let data = geom.attributes[i]
        supplyDataBuffer(data, i)
    }

    var indices = new Uint16Array(geom.triangles.flat())
    var indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    //gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.DYNAMIC_DRAW)*/


    return {
        //mode: gl.TRIANGLES,
        mode: gl.POINTS,
        count: window.position.length,
        type: gl.UNSIGNED_SHORT,
        vao: sphereArray
    }
}
function draw(seconds, dt) {
    gl.clear(gl.COLOR_BUFFER_BIT) 
    gl.useProgram(program)        // pick the shaders

    let m = gl.getUniformLocation(program, 'm')
    gl.uniformMatrix4fv(program.uniforms.p, false, p)

    // todo: for each frame, add the sphere's center to the buffer data using dynamic draw
    const buf_position = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf_position)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(window.position.flat()), gl.DYNAMIC_DRAW)
    gl.vertexAttribPointer(0, window.position[0].length, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(0)

    
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    const f32 = new Float32Array(window.color.flat())
    gl.bufferData(gl.ARRAY_BUFFER, f32, gl.STATIC_DRAW)
    
    gl.vertexAttribPointer(1, window.color[0].length, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(1)

    const buf_radius = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf_radius)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(window.radius.flat()), gl.STATIC_DRAW)
    gl.vertexAttribPointer(2, 1, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(2)






    let rot_mat = matrix.m4rotX(-Math.PI/2)
    //let v = matrix.m4view([0,3,-8], [0,0,0], [0,1,0])
    //console.log([dx,dy,dz])
    //let v = matrix.m4view([dx,dy,dz], [0,0,0], [0,1,0])
    let v = matrix.m4view([0.5,3.7,-18], [0,0,0], [0,1,0])
    gl.uniform1f(program.uniforms.viewport, gl.canvas.width)

    let gravity = [0,-9.8,0]
    // diffuse and specular light
    let ld = matrix.normalize([0,-2.2,5])
    let h = matrix.normalize(matrix.add(ld, [0,0,1]))
    let ma = matrix.m4mul(
        matrix.m4trans(0,0, 0),matrix.m4scale(1,1,1))
    gl.uniformMatrix4fv(m, false, matrix.m4mul(v,ma))
    gl.uniform3fv(program.uniforms.lightdir, ld)
    gl.uniform3fv(program.uniforms.halfway, h)
    gl.drawArrays(gl.POINTS, 0, window.position.length) // then draw things
    //console.log(position[0])
    
    let xmax = 2.0
    let xmin = -2.0
    let ymin = -2.00
    let ymax = 2.00
    let zmin = -2.00
    let zmax = 2.00
    let elas = 0.9
    
     // radius is 0.5, not scaled yet
     // sphere diameter should be 0.15 * cube width, original diameter is 2, radius is 1,
    //let scale = 0.15*(xmax-xmin)/1.76
    let scale = 20
    //let scale = 0.15*4.0
    //let radius = scale/1.2
    for (let i = 0; i < window.position.length; i++){
        let radius = window.radius[i]
        //gl.uniform1f(program.uniforms.radius, radius)
        let pos = position[i]
        let vel = velocity[i]
        //console.log(i)
        let ma = matrix.m4mul(
        matrix.m4trans(pos[0],pos[1], pos[2]),matrix.m4scale(scale,scale,scale))
        //gl.clear(gl.COLOR_BUFFER_BIT)
        //console.log("i ", i, " ",window.color[i])
        //gl.uniform4fv(program.uniforms.color, new Float32Array(window.color[i].flat()))
        //gl.uniform4fv(program.uniforms.color, new Float32Array([255,0,0,1]))
        //gl.bindVertexArray(geom.vao)
        //gl.drawElements(geom.mode, geom.count, geom.type, 0) // then draw things
        gl.drawArrays(gl.POINTS, 0, window.position.count) // then draw things
    

        // new position and velocity
        //console.log("vel at start ", vel)
        if (isNaN(vel[0])){
            console.log("i ", i)
            throw new Error("Value is NaN.");
        }
        let pos_new = matrix.add(pos,matrix.mul(vel,(Math.max(dt),0.01)))
        let vel_new = matrix.add(vel,matrix.mul(gravity,Math.max((dt),0.01)))
        
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
        
        let neighbor_cell = []
        let neighbor_radius = []
        let neighbor_velocity = []
        let size = 4
        let spacing = Math.ceil(max_d)
        let px = Math.floor((position[i][0]-xmin)/spacing)
        let py = Math.floor((position[i][1]-ymin)/spacing)
        let pz = Math.floor((position[i][2]-zmin)/spacing)
        for (let i = 0; i < 2; i++){
            if (pz+i<0 || pz+i > xmax-xmin){
                continue
            }
            for (let j = 0; j < 2; j++){
                if (py+j<0 || py+j > xmax-xmin){
                    continue
                }
                for (let k = 0; k < 2; k++){
                    if (px+k<0 || px+k > xmax-xmin){
                        continue
                    }
                    let nz = pz+i
                    let ny = py+j
                    let nx = px+k
                    let num = (nx*4+ny)*4+nz
                    neighbor_cell.push(space[num])
                    neighbor_radius.push(radius_ordered[num])
                    neighbor_velocity.push(velocity_ordered[num])
                    //console.log(num)
                    //console.log(space[num])
            
                }
            }
        }

        for (let j = 0; j < neighbor_cell.length; j++){
            let neighbor_hold = neighbor_cell[j]
            if (!neighbor_hold){
                continue;
            }
            //console.log("here",neighbor_hold)
            for (let k = 0; k < neighbor_hold.length; k++){
                //console.log("collision detecting")
                //console.log("j: ",j)
                //console.log("velocity j: ",velocity[j])
                let subtract = matrix.sub(neighbor_hold[k], pos)
                let dist = matrix.mag(subtract)
                //console.log("pos j",position[j])
                //console.log("pos",pos)
                //console.log("subtract: ",subtract)
                //let dist = Math.sqrt(xi*xi+yi*yi+zi*zi)
                let radius_2 = neighbor_radius[j][k]
                let collision_dist = radius+radius_2
                //console.log(radius_2) 
                if (dist<collision_dist & position[i] != neighbor_hold[k]){
                    //console.log("collision detected")
                    //let d = matrix.div(matrix.sub(position[j], pos),dist)
                    let d = matrix.normalize(subtract)
                    //console.log("new_vel: ", vel_new)
                    //console.log("d: ", d)
                    let si = matrix.dot(vel_new, d)
                    let sj = matrix.dot(neighbor_velocity[j][k], d)         // solve
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
                    }*/
                    //console.log("si ",si)
                    //console.log("sj ",sj)
                    //console.log("velocity[j] ", velocity[j]) 
                    let s = si-sj
                    //console.log(s)
                    if (s > 0){
                        // all sphere's mass is equal, so their weight is 0.5
                        //console.log("adjust vel")
                        //console.log("d ", d)
                        let factor = s*(1.0+elas)
                        //console.log("Factor: ",factor)
                        let mass_i = 4/3 * Math.PI*radius*radius*radius
                        let mass_j = 4/3 * Math.PI**radius_2*radius_2*radius_2
                        let col_new = mass_j/(mass_j+mass_i)
                        let col_j = mass_i/(mass_j+mass_i)
                        //let col_new = 0.5
                        //let col_j = 0.5

                        vel_new = matrix.add(matrix.add(vel_new,matrix.mul(d,-1*col_new*factor)), matrix.mul(gravity,Math.max((dt),0.01)))
                        pos_new = matrix.add(pos_new,matrix.mul(vel_new,Math.max((dt*0.1),0.0005)))
                        //console.log(vel_new)

                        //console.log("new vel ", vel_new)
                        //console.log("velocity j before adding ", velocity[j])
                        neighbor_velocity[j][k] = matrix.add(matrix.add(neighbor_velocity[j][k],matrix.mul(d,1*col_j*factor)), matrix.mul(gravity,Math.max((dt),0.01)))
                       
                        neighbor_hold[k] = matrix.add(neighbor_hold[k],matrix.mul(neighbor_velocity[j][k],Math.max(dt*0.1,0.0005)))
                        //console.log("velocity j at end: ",velocity[j])
                    }
                }

            }
        }
                window.position[i] = pos_new
                window.velocity[i] = vel_new
                //console.log(pos, "+ ",vel, "* ", seconds-window.time[i], "=", pos_new)
                //console.log("vel at end :",vel_new)
                //console.log("pos", pos_new)
                //console.log("vel", vel_new)
                window.time[i] = seconds
                

                //console.log(window.position[i])
            }
    spatial_partitioning(xmax,xmin)

}


function tick(milliseconds) {
    
    if (!startTime){
        startTime = milliseconds
    }
    if (!prevTime) {
        prevTime = milliseconds;
    }

    const dt = (milliseconds - prevTime) / 1000; // Delta time in seconds
    prevTime = milliseconds; // Update last frame time
    //const seconds = milliseconds / 1000*/
    let seconds = (milliseconds - startTime) / 1000
    //console.log(seconds)
    
    document.querySelector('#fps').innerHTML = (1/dt).toFixed(1)
    
    if (seconds >= 15){
        startTime = milliseconds;
        seconds = 0;
        setProperties(window.sphereCount,2,-2)
        console.log("times up")
    }
    
    draw(seconds, dt)
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
    //setProperties(1, 2, -2)

    setProperties(20, 2, -2)
    let vs = await fetch('vertex.glsl').then(res => res.text())
    let fs = await fetch('fragment.glsl').then(res => res.text())
    window.program = compileShader(vs,fs)
    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    //let sphere = await fetch('sphere.json').then(res => res.json())
    //addNormals(sphere)
    fillScreen()
    window.addEventListener('resize', fillScreen)
    window.geom = setupGeomery()
    window.startTime = null;
    window.prevTime = null;
    window.sphereCount = 20
    //tick(0)
    requestAnimationFrame(tick)

    /*
    tick(0)*/
})
function setProperties(balls, maximum, minimum){
    window.color = []
    let ball = balls
    for (let i = 0; i < ball; i++){
        color.push([Math.random(),Math.random(),Math.random(),1.0 ])
    }
    //console.log(window.color)
    //window.dx = 0
    //window.dy = 0
    window.dz = 0
    window.position = []
    window.velocity = new Array()
    window.time = []
    window.radius = []
    //let radius = []
    window.max_d = -1
    let max = maximum
    let min = minimum
    // position set to random coordinate, velocity set randomly at start
    for (let i = 0; i < ball; i++){
        //console.log(" start ",velocity)
        let p1 = Math.random()*(0.8*max) +min*0.5 
        let p2 = Math.random()*(max+0.5) +(min*0.5) 
        let p3 = Math.random()*(1.4*max) +min 
        let v1 = (Math.random()*(1.4*max) +min)*0.001 
        let v2 = (Math.random()*(1.4*max) +min) *0.001
        let v3 = (Math.random()*(1.4*max) +min )*0.001
        let pos = [p1, p2,p3]
        let vel = [v1,v2,v3]
        //let vel = [i,i,i]
        //position.push([Math.random()*((max-min)+min), Math.random()*((max-min)+min), Math.random()*((max-min)+min)])
        window.velocity.push(vel)
        position.push(pos)
        time.push(0)
        let r= (Math.random()+.25) * (0.75/ball**(1/3))
        if (r*2 > max_d){
            max_d = r*2
        }
        window.radius.push(r)
        spatial_partitioning(max,min)
        //window.mass.push(4/3 * Math.PI*r*r*r)
    }




    console.log("color", color[0])

    for (let i = 0; i < window.radius.length; i++){
        console.log(window.radius[i])
    }

    console.log("position", window.position[0])
    //console.log("color", color.length)
    console.log("radius", window.radius[0])
    console.log(position[0])
    
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    const f32 = new Float32Array(window.color.flat())
    gl.bufferData(gl.ARRAY_BUFFER, f32, gl.STATIC_DRAW)
    
    gl.vertexAttribPointer(1, window.color[0].length, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(1)

    const buf_radius = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf_radius)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(window.radius.flat()), gl.STATIC_DRAW)
    gl.vertexAttribPointer(2, 1, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(2)

}

function spatial_partitioning(max, min){
    let spacing = Math.ceil(window.max_d)
    let size = max-min
    window.space = new Array(size*size*size)
    window.radius_ordered = new Array(size*size*size)
    window.velocity_ordered = new Array(size*size*size)
    //console.log("space", space)
    for (let i = 0; i < space.length; i++){
        space[i] = []
        radius_ordered[i] = []
        velocity_ordered[i] = []
    }
    for (let i = 0; i < position.length; i++){
        let px = Math.floor((position[i][0]-min)/spacing)
        let py = Math.floor((position[i][1]-min)/spacing)
        let pz = Math.floor((position[i][2]-min)/spacing)
        if (px > 3){
            px = 3
        } else if(px < 0){
            px = 0
        }
        if (py > 3){
            py = 3
        }else if(py < 0){
            py = 0
        }
        if (pz > 3){
            pz = 3
        }else if(pz < 0){
            pz = 0
        }
        let num = (px*size+py)*size+pz
        //console.log("length: ",space.length)
        //console.log("num",num)
        //console.log([px,py,pz])
        //console.log([position[i][0]-min,position[i][1]-min,position[i][2]-min])
        space[num].push(position[i])
        radius_ordered[num].push(radius[i])
        velocity_ordered[num].push(velocity[i])
    }
}
document.querySelector('#submit').addEventListener('click', event => {
    window.sphereCount = Number(document.querySelector('#spheres').value) || 2
    // TO DO: generate a new gridsize-by-gridsize grid here, then apply faults to it

    // setupGeomery(max, min, grid_size, fault
    setProperties(window.sphereCount, 2, -2)
    window.startTime = null;
    window.prevTime = null;
    //addNormals(sphere)
    //requestAnimationFrame(tick)
})

window.keysBeingPressed = {}
window.addEventListener('keydown', event => keysBeingPressed[event.key] = true)
window.addEventListener('keyup', event => keysBeingPressed[event.key] = false)

