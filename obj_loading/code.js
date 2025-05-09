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
/*
function m4trans(dx,dy,dz){ 
    return new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, dx,dy,dz,1])
}*/

/*
function m4mul(...args){args.reduce((m1,m2) => {
    if(m2.length == 4) return m2.map((e,i)=>m4rowdot(m1,i,m2)) // m*v
    if(m1.length == 4) return m1.map((e,i)=>m4rowdot(m2,i,m1)) // v*m
    let ans = new m1.constructor(16)
    for(let c=0; c<4; c+=1) for(let r=0; r<4; r+=1)
      ans[r+c*4] = m4rowdot(m1,r,m4col(m2,c))
    return ans // m*m
  })
}
function sub (x,y) {x.map((e,i)=>e-y[i])}*/
// square grid and fault implementation
function setupGeomery(data) {
    
    //console.log(data)

    var objArray = gl.createVertexArray()
    gl.bindVertexArray(objArray)

    let vertices = []
    let indices = []
    let color = []
    let normal = []
    //if (err) throw err;
    const lines = data.trim().split("\n");
    lines.forEach((line, index) => {
        //console.log(line.split(' '))
        let separated = line.split(' ').filter(item => item.trim() != '')
        //console.log(separated[0])
        if (line[0] == 'v'){        // check for v vertices

            if (separated.length == 4){   // vertices only
                vertices.push([parseFloat(separated[1]), parseFloat(separated[2]), parseFloat(separated[3])])
                color.push([0.8275, 0.8275, 0.8275])    // light gray color
                //console.log("vertices: ",[parseFloat(separated[1]), parseFloat(separated[2]), parseFloat(separated[3])])
                //console.log("color: ",[0.8275, 0.8275, 0.8275])
            }

            else if(separated.length == 7){   // vertices and colors
                vertices.push([parseFloat(separated[1]), parseFloat(separated[2]), parseFloat(separated[3])])
                color.push([parseFloat(separated[4]), parseFloat(separated[5]), parseFloat(separated[6])])    // light gray color
                //console.log("vertices: ",[parseFloat(separated[1]), parseFloat(separated[2]), parseFloat(separated[3])])
                //console.log("color: ",[parseFloat(separated[4]), parseFloat(separated[5]), parseFloat(separated[6])])
            }

        }
        else if (line[0] == 'f'){                 // check for f indices

            if  (separated.length == 4){      // face with only 3 indices
            indices.push([(Number(separated[1])-1), (Number(separated[2])-1), (Number(separated[3])-1)])
            //console.log("indices: ",[(Number(separated[1])-1), (Number(separated[2])-1), (Number(separated[3])-1)])
            } else if (separated.length < 4){                                // face with more than 3 indices
                let num = separated.length -3
                for (let i = 0; i < num; i++){
                    indices.push([(Number(separated[1])-1), (Number(separated[i+2])-1), (Number(separated[i+3])-1)])
                    //console.log("indices: ",[(Number(separated[1])-1), (Number(separated[i+2])-1), (Number(separated[i+3])-1)])
                }
            } 
        }

    
    });
    if (normal.length == 0){
        for (let i = 0; i < indices.length; i++){
            //console.log(vertices[i])
            //console.log("ind ",indices)
            //console.log(indices[0][0])
            let p0 = vertices[indices[i][0]]
            let p1 = vertices[indices[i][1]]
            let p2 = vertices[indices[i][2]]
            //console.log(p0)
            //console.log(p1)
            let e1 = matrix.sub(p1,p0)
            let e2 = matrix.sub(p2,p0)
            let n = matrix.cross(e1,e2)
            console.log(matrix.normalize(n))
            normal.push(matrix.normalize(n))
        }
    }
    let m = matrix.m4rotY(40/2)
    let v = matrix.m4view([1,-1,2], [0,0,0], [0,1,0])
    for (let i = 0; i < v.length; i++){
        console.log("from v: i is ", i, "v is ", v[i])
    }

    let mv = matrix.m4mul(m,v)
    for (let i = 0; i < mv.length; i++){
        console.log("from mv: i is ", i, "v is ", p[i])
    }

    /*
    for (let i = 0; i < indices.length; i++){
        console.log(indices[i])
    }
    for (let i = 0; i < color.length; i++){
        console.log(color[i])
    }
    for (let i = 0; i < vertices.length; i++){
        console.log(vertices[i])
    }*/

      
    let buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices.flat()), gl.STATIC_DRAW)
    gl.vertexAttribPointer(0,vertices[0].length,gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(0)

    // store color to buffer
    let buf_color = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf_color)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color.flat()), gl.STATIC_DRAW)
    gl.vertexAttribPointer(1, color[0].length, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(1)

    // store normal to buffer
    let buf_normal = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf_normal)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normal.flat()), gl.STATIC_DRAW)
    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(2)

    // store indices
    var indice_buf = new Uint16Array(indices.flat())
    var indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indice_buf, gl.STATIC_DRAW)

    console.log("return")
    console.log(indice_buf[0])

    // we return all the bits we'll need to use this work later
    return {
        mode:gl.TRIANGLES,      // grab 3 indices per triangle
        count:indice_buf.length,   // out of this many indices overall
        type:gl.UNSIGNED_SHORT, // each index is stored as a Uint16
        vao:objArray       // and this VAO knows which buffers to use
        }
}

function draw(seconds) {
    let s = 1.0
    if (keysBeingPressed['a']){
        dx -=0.01*s
        //console.log("a")
     } if(keysBeingPressed['d']){
         dx +=0.01*s
     }if (keysBeingPressed['w']){
        dy -=0.01*s
        //console.log("a")
     } if (keysBeingPressed['s']){
         dy +=0.01*s
     }
     if (keysBeingPressed['q']){
        dz -=0.01*s
    }
    if (keysBeingPressed['e']){
        dz+=0.01*s
    }

    //console.log("dz: ", dz)
    //console.log("dx: ", dx)
    //console.log("dy: ", dy)
    gl.clear(gl.COLOR_BUFFER_BIT) 
    //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.useProgram(program)        // pick the shaders
    //gl.bindVertexArray(obj.vao)  // and the buffers
    //let m = matrix.m4mul(matrix.m4rotY(seconds), matrix.m4rotX(-Math.PI/2))
    //let m =matrix.m4rotX(seconds/20)
    /*let m = new Float32Array([1,0,0,0,
                            0,1,0,0
                            ,0,0,1,0,
                            0,0,0,1
    ])*/
    //let m =matrix.m4trans(1,0,0)
    let m = matrix.m4rotZ(seconds/2)

    //let v = matrix.m4view([0,0.34,-0.1], [0,0,0], [0,1,0]) 0, 2.4, -0.18
    let v = matrix.m4view([0, 4.8, -0.36], [0,0,0], [0,1,0]) 
    //let v = matrix.m4view([0.41, 0.87, -5.98], [0,0,0], [0,1,0])0.41, 0.87, -5.98
    //gl.uniformMatrix4fv(program.uniforms.mv, false, matrix.m4mul(v,m))
    gl.uniformMatrix4fv(program.uniforms.mv, false, matrix.m4mul(v,m))
    //gl.uniformMatrix4fv(program.uniforms.mv, false, m)
    gl.uniformMatrix4fv(program.uniforms.ma, false, m)
    gl.uniformMatrix4fv(program.uniforms.p, false, p)

    let ld = matrix.normalize([0,3,1])
    let h_eye = matrix.m4mul(v,m)
    let h = matrix.normalize(matrix.add(ld, h_eye))
    gl.uniform3fv(program.uniforms.lightdir, ld)
    gl.uniform3fv(program.uniforms.halfway, h)

    gl.bindVertexArray(obj.vao)  // and the buffers
    gl.drawElements(obj.mode, obj.count, obj.type, 0) // then draw things
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
    //gl.viewport(0,0, canvas.width, canvas.height)
    // TO DO: compute a new projection matrix based on the width/height aspect ratio
    if (window.gl) {
        gl.viewport(0,0, canvas.width, canvas.height)
        //window.p = m4perspNegZ(0.1, 10, 1, canvas.width, canvas.height)
        window.p = matrix.m4perspNegZ(0.05, 10, 1, canvas.width, canvas.height)
    }
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
    window.dx = 0
    window.dy = 0
    window.dz = 0

    /*
    tick(0)*/
})

// evenet listener for button
document.querySelector('#submit').addEventListener('click', async event => {
    //const file = event.target.files[0];
    const file = String(document.querySelector('#file').value) || ""
    console.log(file)
    let result = await fetch(file).then(r=>r.text())
    //console.log(result)
    window.obj = setupGeomery(result)
    tick(0)
})

window.keysBeingPressed = {}
window.addEventListener('keydown', event => keysBeingPressed[event.key] = true)
window.addEventListener('keyup', event => keysBeingPressed[event.key] = false)