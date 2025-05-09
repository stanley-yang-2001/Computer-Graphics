import math
import numpy as np


def dda(p1, p2, dim):
    # (x,y,z,w,r,g,b)

    #print(f"p1 coor: {p1[0:2]}")
    #print(f"p2 coor: {p2[0:2]}")
    # setup
    #1
    x_axis = False
    steps = -1

    if dim == "x":
        x_axis = True


    if (((p1[0] == p2[0]) & (x_axis == True)) | ((p1[1] == p2[1]) & (x_axis == False))):
        #return [p2]
        return 0
    if ((x_axis == False) & (p2[1] < p1[1])):
        p1,p2 = p2,p1
    if ((x_axis == True) & (p2[0] < p1[0])):
        p1,p2 = p2,p1

    # 3
    x_length = p2[0]-p1[0]
    y_length = p2[1]-p1[1]

    length = -1
    # 2
    if x_axis:
        length = abs(x_length)
        steps = math.ceil(p2[0])-math.ceil(p1[0])
    else:
        length = abs(y_length)
        steps = math.ceil(p2[1])-math.ceil(p1[1])

    # interpolate other coordinates
    z_inc = (p2[2]-p1[2])/length
    w_inc = (p2[3]-p1[3])/length
    r_inc = (p2[4]-p1[4])/length
    g_inc = (p2[5]-p1[5])/length
    b_inc = (p2[6]-p1[6])/length
    a_inc = (p2[7]-p1[7])/length
    s_inc = (p2[8]-p1[8])/length
    t_inc = (p2[9]-p1[9])/length
    


    #4


    x_inc = x_length/length
    y_inc = y_length/length

    # first potential pointcls

    e_x = math.ceil(p1[0])-p1[0]         # ceil(first point's coordinate's x or y) - initial x/y, depending on which axis you're going

    e_y = math.ceil(p1[1])-p1[1]

    '''
    e_z = math.ceil(p1[2])-p1[2]
    e_w = math.ceil(p1[3])-p1[3]
    e_r = math.ceil(p1[4])-p1[4]
    e_g = math.ceil(p1[5])-p1[5]
    e_b = math.ceil(p1[6])-p1[6]
    e_a = math.ceil(p1[7])-p1[7]
    e_s = math.ceil(p1[8])-p1[8]
    e_t = math.ceil(p1[9])-p1[9]

    a_x = e_x*x_inc
    a_y = e_y*y_inc'''

    if x_axis:
        a_x = e_x*x_inc
        a_y = e_x*y_inc
        a_z = e_x*z_inc
        a_w = e_x*w_inc
        a_r = e_x*r_inc
        a_g = e_x*g_inc
        a_b = e_x*b_inc 
        a_a = e_x*a_inc 
        a_s = e_x*s_inc 
        a_t = e_x*t_inc 
    else:
        a_x = e_y*x_inc
        a_y = e_y*y_inc
        a_z = e_y*z_inc
        a_w = e_y*w_inc
        a_r = e_y*r_inc
        a_g = e_y*g_inc
        a_b = e_y*b_inc 
        a_a = e_y*a_inc 
        a_s = e_y*s_inc 
        a_t = e_y*t_inc 


    s_steps = math.ceil(p2[8])-math.ceil(p1[8])
    t_steps = math.ceil(p2[9])-math.ceil(p1[9])


    points_made = []
    new_point = [p1[0]+a_x, p1[1]+a_y, p1[2]+a_z, p1[3]+a_w, p1[4]+a_r, p1[5]+a_g, 
                 p1[6]+a_b, p1[7]+a_a, p1[8]+a_s, p1[9]+a_t]

    #print(f"red: {p1[4]} - a_r {a_r} = {p1[4]+a_r} ")

    #print(f"initial points: {new_point[0:2]}")

    for i in range(steps):
            if x_axis:
                if (new_point[0] < p2[0]):

                    #print(f"added points: {new_point[0:2]}")
                    points_made.append(new_point)
                    new_point = new_point = [new_point[0]+x_inc, new_point[1]+y_inc,
                                 new_point[2]+z_inc, new_point[3]+w_inc,
                                 new_point[4]+r_inc, new_point[5]+g_inc,
                                 new_point[6]+b_inc, new_point[7]+a_inc,
                                 new_point[8]+s_inc, new_point[9]+t_inc]
            else:
                if (new_point[1] < p2[1]):

                    #print(f"added points: {new_point[0:2]}")
                    points_made.append(new_point)
                    new_point = new_point = [new_point[0]+x_inc, new_point[1]+y_inc,
                                 new_point[2]+z_inc, new_point[3]+w_inc,
                                 new_point[4]+r_inc, new_point[5]+g_inc,
                                 new_point[6]+b_inc, new_point[7]+a_inc,
                                 new_point[8]+s_inc, new_point[9]+t_inc]
        #print(f"rgb: {new_point[4]}, {new_point[5]}, {new_point[6]} ")

    

    points_made = np.array(points_made)
    
    return points_made

