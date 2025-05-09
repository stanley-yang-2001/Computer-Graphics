let neighbor_cell = []
let neighbor_radius = []
let neighbor_velocity = []
let size = 4
px = Math.floor((position[i][0]-min)/spacing)
py = Math.floor((position[i][1]-min)/spacing)
pz = Math.floor((position[i][2]-min)/spacing)
for (let i = -1; i < 2; i++){
    if (pz+i<0){
        continue
    }
    for (let j = -1; j < 2; j++){
        if (py+j<0){
            continue
        }
        for (let k = -1; k < 2; k++){
            if (px+k<0){
                continue
            }
            let nz = pz+i
            let ny = py+j
            let nx = px+k
            let num = (nx*4+ny)*4+nz
            neighbor_cell.push(space[num])
            neighbor_radius.push(radius_ordered[num])
            neighbor_velocity.push(velocity_ordered[num])
    
        }
    }
}

for (let j = 0; j < neighbor_cell.length; j++){
    let neighbor_hold = neighbor_cell[j]
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
        let radius_1 = radius[i]
        let radius_2 = neighbor_radius[j][k]
        let collision_dist = radius_1+radius_2 
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
            console.log("si ",si)
            console.log("sj ",sj)
            //console.log("velocity[j] ", velocity[j]) 
            let s = si-sj
            //console.log(s)
            if (s > 0){
                // all sphere's mass is equal, so their weight is 0.5
                //console.log("adjust vel")
                //console.log("d ", d)
                let factor = s*(1.0+elas)
                //console.log("Factor: ",factor)
                let mass_i = 4/3 * Math.PI*radius_1*radius_1*radius_1
                let mass_j = 4/3 * Math.PI**radius_2*radius_2*radius_2
                let col_new = mass_j/(mass_j+mass_i)
                let col_j = mass_i/(mass_j+mass_i)
                vel_new = matrix.add(vel_new,matrix.mul(d,-1*col_new*factor))
                pos_new = matrix.add(pos_new,matrix.mul(vel_new,(seconds-window.time[i])))
                //console.log(vel_new)

                //console.log("new vel ", vel_new)
                //console.log("velocity j before adding ", velocity[j])
                neighbor_velocity[j][k] = matrix.add(neighbor_velocity[j][k],matrix.mul(d,col_j*factor))
                neighbor_hold[k] = matrix.add(neighbor_hold[k],matrix.mul(neighbor_velocity[j][k],(seconds-window.time[i])))
                //console.log("velocity j at end: ",velocity[j])
            }
        }

    }
}



// original: 

/*

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
                }*/
                    console.log("si ",si)
                    console.log("sj ",sj)
                    console.log("velocity[j] ", velocity[j]) 
                    let s = si-sj
                    //console.log(s)
                    if (s > 0){
                        // all sphere's mass is equal, so their weight is 0.5
                        //console.log("adjust vel")
                        //console.log("d ", d)
                        let factor = s*(1.0+elas)
                        //console.log("Factor: ",factor)
                        let mass_i = 4/3 * Math.PI*window.radius[i]*window.radius[i]*window.radius[i]
                        let mass_j = 4/3 * Math.PI*window.radius[j]*window.radius[j]*window.radius[j]
                        let col_new = mass_j/(mass_j+mass_i)
                        let col_j = mass_i/(mass_j+mass_i)
                        vel_new = matrix.add(vel_new,matrix.mul(d,-1*col_new*factor))
                        pos_new = matrix.add(pos_new,matrix.mul(vel_new,(seconds-window.time[i])))
                        //console.log(vel_new)
    
                        //console.log("new vel ", vel_new)
                        //console.log("velocity j before adding ", velocity[j])
                        velocity[j] = matrix.add(velocity[j],matrix.mul(d,col_j*factor))
                        //console.log("velocity j at end: ",velocity[j])
                    }
    
                }
            }
*/