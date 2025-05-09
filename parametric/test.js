// Online Javascript Editor for free
// Write, Edit and Run your Javascript code using JS Online Compiler

console.log("Try programiz.pro");

let max = 1
let min = -1
let origin_vect = [0, min, 0]
let end_vect = [0,max, 0]
let ring = 2
let layer = []
let inc = (max-min)/(ring+1)
let hyp = 1

let ratio = []

let slices = 3
let angle_inc = 2*Math.PI/slices

let vertices = []
let indices_s = []
let color = new Array()

// y values
for (let i = 0; i < ring; i++){
    layer.push(min+inc*(i+1))
    let angle = Math.asin(layer[i]/hyp)
    let horizontal = hyp*Math.cos(angle)
    ratio.push(horizontal)
    console.log(layer[i])
}  


// vertices
for (let i = 0; i < layer.length; i++){
    console.log("layer ", layer[i])
    for (let j = 0; j < slices; j++){
        let x = ratio[i]*Math.cos(0+angle_inc*j)
        let z = ratio[i]*Math.sin(0+angle_inc*j)
        vertices.push([x, layer[i], z])
        color.push([247/255, 212/255, 129/255,1])
        console.log("x: ", x, " z: ", z)
    }
}
vertices.push(origin_vect)
vertices.push(end_vect)


// indices generation
for (let i = 0; i<ring-1; i++){
    for (let j = 0; j < slices; j++){
        if (j % slices == slices-1){
            indices_s.push(i*slices+j, i*slices+j-(slices-1), i*slices+j+slices)
            indices_s.push(i*slices+j-(slices-1), i*slices+j+slices, i*slices+j+1)
            console.log(i*slices+j, i*slices+j-(slices-1), i*slices+j+slices)
            console.log(i*slices+j-(slices-1), i*slices+j+slices, i*slices+j+1)
        } else{
            indices_s.push(i*slices+j, i*slices+j+1, i*slices+j+slices)
            indices_s.push(i*slices+j+1, i*slices+j+slices, i*slices+j+slices+1)
            console.log(i*slices+j, i*slices+j+1, i*slices+j+slices)
            console.log(i*slices+j+1, i*slices+j+slices, i*slices+j+slices+1)
        }
    }
}

// indices generation continue (for the two pole)
for (let i = 0; i < 2; i++){
    let pos = vertices.length-2+i
    for (let j = 0; j < slices; j++){
        if(i == 0){
            if (j == slices-1){
                indices_s.push(pos, j, j-(slices-1))
                console.log(pos, j, j-(slices-1))
            }else{
                indices_s.push(pos, j, j+1)
                console.log(pos, j, j+1)
            }
        }else{
            let curr = vertices.length-2-slices
            if (j == slices-1){
                indices_s.push(pos, curr+j, curr+j-(slices-1))
                console.log(pos, curr+j, curr+j-(slices-1))
            }else{
                indices_s.push(pos, curr+j, curr+j+1)
                console.log(pos, curr+j, curr+j+1)
            }
        }
        
    }
}

let normal_grid = new Array()

console.log("length", vertices.length)
for (let i = 0; i < vertices.length; i++){
console.log(matrix.normalize(vertices[i]))
normal_grid.push(matrix.normalize(vertices[i]))
}





