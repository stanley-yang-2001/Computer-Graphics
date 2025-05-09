from PIL import Image
import sys
import numpy as np
import scanline
import math



filename = ""
color = False
red = []
green= []
blue = []
alpha = []
x_coor = []
y_coor = []
z_coor = []
w_coor = []
coor = []

draw = 0
width = 0
height = 0
value = 0

# mode setting
depth = False
z_buffer = None
#x_y_refresh = None
sRGB = False
hyp = False
fsaa = False
fsaa_level = 0
cull = False
decals = False
frustum = False

# uniform state
texture_file = None

matrix = []

# buffer povision
position_size = 0
color_size = 0
texcoord_size = 2
texcoord_s = []
texcoord_t = []

point_size = 1
point_size_array = []

element_array=[]
color_map = None

file= sys.argv[1]
f = open(file, "r")
#image = Image.new("RGBA", (width, height), (0,0,0,0))
image = None


for word in f:

    # 7.1 PNG
    if "png" ==word[0:3]:
        dimension = word.split()
        width = int(dimension[1])
        height = int(dimension[2])
        filename = dimension[-1]
        image = Image.new("RGBA", (width, height), (0,0,0,0))
    # 7.2 Mode setting

    elif "depth" in word:                                        # core
        depth = True
        z_buffer = np.full((width, height), 1000, dtype=float)
        #x_y_refresh = np.full([width, height], np.nan, dtype=np.ndarray)
    
    elif "sRGB" in word:                                         # core
        sRGB = True

    elif "hyp" in word:                                          # core
        hyp = True

    elif "fsaa" in word:
        fsaa_option = word.split()
        fsaa = True
        fsaa_level = fsaa_option[-1]
    
    elif "cull" in word:
        cull = True
    
    elif "decals" in word:
        decals = True

    elif "frustum" in word:
        frustum = True

    # 7.3 uniform state

    elif "texture" in word:
        texture_option = word.split()
        texture_file = texture_option[-1]

    elif "uniformMatrix " in word:
        matrix = None
        matrix_option = word.split()
        holder = [float(i) for i in matrix_option[1:len(matrix_option)]]
        matrix = np.transpose(np.array(holder).reshape(4,4))



    # 7.4 Buffer provision

    elif "position" == word[0:8]:

        coordinate = word.split()
        position_size = int(coordinate[1])
        x_coor.clear()
        y_coor.clear()
        z_coor.clear()
        w_coor.clear()
        if (position_size == 2):
            for num in range (2,len(coordinate)):
                if (num % 2 == 0):
                    x_coor.append(float(coordinate[num]))
                elif (num % 2 == 1):
                    y_coor.append(float(coordinate[num]))
            z_coor = [0.0 for i in range(len(x_coor))]
            w_coor = [1.0 for i in range(len(x_coor))]

        elif (position_size == 3):
            for num in range (2,len(coordinate)):
                if (num % 3 == 2):
                    x_coor.append(float(coordinate[num]))
                elif (num % 3 == 0):
                    y_coor.append(float(coordinate[num]))
                elif (num % 3 == 1):
                    z_coor.append(float(coordinate[num]))
            w_coor = [1.0 for i in range(len(x_coor))]
        
        elif (position_size == 4):
            for num in range (2,len(coordinate)):
                if (num % 4 == 2):
                    x_coor.append(float(coordinate[num]))
                elif (num % 4 == 3):
                    y_coor.append(float(coordinate[num]))
                elif (num % 4 == 0):
                    z_coor.append(float(coordinate[num]))
                elif (num % 4 == 1):
                    w_coor.append(float(coordinate[num]))
        # division by  w + viewpoint transformation
        


    elif "color" in word:
        color = True
        color_palette = word.split()
        color_size = int(color_palette[1])
        red.clear()
        green.clear()
        blue.clear()
        alpha.clear()

        if color_size == 3:
            for x in range (2,len(color_palette)):
                if (x % 3 == 2):
                    red.append(float(color_palette[x]))
                elif (x % 3 == 0):
                    green.append(float(color_palette[x]))
                elif (x % 3 == 1):
                    blue.append(float(color_palette[x]))
            alpha = [1 for i in range(len(red))]


        elif color_size == 4:
            for x in range (2,len(color_palette)):
                if (x % 4 == 2):
                    red.append(float(color_palette[x]))
                elif (x % 4 == 3):
                    green.append(float(color_palette[x]))
                elif (x % 4 == 0):
                    blue.append(float(color_palette[x]))
                elif (x % 4 == 1):
                    alpha.append(float(color_palette[x]))
            color_map = np.full([width, height], np.nan, dtype=np.ndarray)


    elif "texcoord" in word:
        texcoord_option = word.split()
        texcoord_size = int(texcoord_option[1])
        texcoord_s.clear()
        texcoord_t.clear()
        for i in range(2, len(texcoord_option)):
            if (i % 2 == 0):
                texcoord_s.append(float(texcoord_option[i]))
            elif (i % 2 == 1):
                texcoord_t.append(float(texcoord_option[i]))
    

    elif "pointsize" in word:
        pointsize_option = word.split()
        point_size = int(pointsize_option[1])
        point_size_array = [float(i) for i in pointsize_option[2:len(pointsize_option)]]
    
    elif "elements" in word:                                        # core
        element_option = word.split()
        element_array = element_option[1:len(element_option)]

    # 7.5 drawing

    elif "drawArraysTriangles" in word: 
        x_hold = [i for i in x_coor]
        y_hold = [i for i in y_coor]
        z_hold = [i for i in z_coor]
        w_hold = [i for i in w_coor]

        if isinstance(matrix, np.ndarray) != False:
            x_hold = [i for i in x_coor]
            y_hold = [i for i in y_coor]
            z_hold = [i for i in z_coor]
            w_hold = [i for i in w_coor]
            

            for i in range(len(x_coor)):
                hold = np.array([x_coor[i], y_coor[i],z_coor[i], w_coor[i] ]).reshape(-1,1)
                result = np.matmul(matrix, hold)
                x_coor[i] = result[0]
                y_coor[i] = result[1]
                z_coor[i] = result[2]
                w_coor[i] = result[3]

        for i in range(len(x_coor)):
            x_coor[i] = ((x_coor[i]+w_coor[i])) * width/(2*w_coor[i])
            y_coor[i] = ((y_coor[i]+w_coor[i])) * height/(2*w_coor[i])
            z_coor[i] = z_coor[i]/w_coor[i]
            w_coor[i] = 1/w_coor[i]
        if color == False:
            red = [0 for i in range(len(x_coor))]
            blue = [0 for i in range(len(x_coor))]
            green = [0 for i in range(len(x_coor))]
            alpha = [1 for i in range(len(x_coor))]
        req = word.split()
        first = int(req[1])
        count = int(int(req[2])/3)
        if texture_file == None:
            texcoord_s = [0 for i in range(len(x_coor))]
            texcoord_t = [0 for i in range(len(x_coor))]
        for i in range(int(count)):
            p = first+3*i
            '''
            pt1 = [x_coor[p], y_coor[p], z_coor[p], w_coor[p], red[p]*w_coor[p], 
                   green[p]*w_coor[p], blue[p]*w_coor[p], alpha[p]*w_coor[p], 
                   texcoord_s[p]*w_coor[p], texcoord_t[p]*w_coor[p]]
            
            pt2 = [x_coor[p+1], y_coor[p+1], z_coor[p+1], w_coor[p+1], red[p+1]*w_coor[p+1], 
                   green[p+1]*w_coor[p+1], blue[p+1]*w_coor[p+1], alpha[p+1]*w_coor[p+1],
                   texcoord_s[p+1]*w_coor[p+1], texcoord_t[p+1]*w_coor[p+1]]
            
            pt3 = [x_coor[p+2], y_coor[p+2], z_coor[p+2], w_coor[p+2], red[p+2]*w_coor[p+2], 
                   green[p+2]*w_coor[p+2], blue[p+2]*w_coor[p+2], alpha[p+2]*w_coor[p+2],
                   texcoord_s[p+2]*w_coor[p+2], texcoord_t[p+2]*w_coor[p+2]]'''

            if hyp:
                
                pt1 = [x_coor[p], y_coor[p], z_coor[p], w_coor[p], red[p]*w_coor[p], 
                   green[p]*w_coor[p], blue[p]*w_coor[p], alpha[p]*w_coor[p], 
                   texcoord_s[p]*w_coor[p], texcoord_t[p]*w_coor[p]]
            
                pt2 = [x_coor[p+1], y_coor[p+1], z_coor[p+1], w_coor[p+1], red[p+1]*w_coor[p+1], 
                   green[p+1]*w_coor[p+1], blue[p+1]*w_coor[p+1], alpha[p+1]*w_coor[p+1],
                   texcoord_s[p+1]*w_coor[p+1], texcoord_t[p+1]*w_coor[p+1]]
            
                pt3 = [x_coor[p+2], y_coor[p+2], z_coor[p+2], w_coor[p+2], red[p+2]*w_coor[p+2], 
                   green[p+2]*w_coor[p+2], blue[p+2]*w_coor[p+2], alpha[p+2]*w_coor[p+2],
                   texcoord_s[p+2]*w_coor[p+2], texcoord_t[p+2]*w_coor[p+2]]
            else:
                pt1 = [x_coor[p], y_coor[p], z_coor[p], w_coor[p], red[p], 
                   green[p], blue[p], alpha[p], 
                   texcoord_s[p], texcoord_t[p]]
            
                pt2 = [x_coor[p+1], y_coor[p+1], z_coor[p+1], w_coor[p+1], red[p+1], 
                   green[p+1], blue[p+1], alpha[p+1],
                   texcoord_s[p+1], texcoord_t[p+1]]
            
                pt3 = [x_coor[p+2], y_coor[p+2], z_coor[p+2], w_coor[p+2], red[p+2], 
                   green[p+2], blue[p+2], alpha[p+2],
                   texcoord_s[p+2], texcoord_t[p+2]]

            
            total_pts = scanline.scanline(pt1, pt2, pt3)

            count = 0
            for j in total_pts:
                for l in j:
                    if ((int(l[0]) >= width) | (int(l[1]) >= height)):
                        continue
                    if hyp:
                        l[4] = l[4]/l[3]
                        l[5] = l[5]/l[3]
                        l[6] = l[6]/l[3]
                        l[7] = l[7]/l[3]
                        l[8] = l[8]/l[3]
                        l[9] = l[9]/l[3]


                    if sRGB & color:
                        if l[4]  <= 0.0031308:
                            l[4] = l[4]*12.95
                        else:
                            l[4] = (1.055*l[4]**(1/2.4) )- 0.055

                        if l[5]  <= 0.0031308:
                            l[5] = l[5]*12.95
                        else:
                            l[5] = (1.055*l[5]**(1/2.4) )- 0.055

                        if l[6]  <= 0.0031308:
                            l[6] = l[6]*12.95
                        else:
                            l[6] = (1.055*l[6]**(1/2.4) )- 0.055


                    if ((l[8] > 1) | (l[8] < 0)):
                        l[8] = l[8]-math.floor(l[8])
                    
                    if ((l[9] > 1) | (l[9] < 0)):
                        l[9] = l[9]-math.floor(l[9])


                    if depth:
                        if l[2] <= z_buffer[int(l[0])][int(l[1])]:
                            z_buffer[int(l[0])][int(l[1])] = l[2]

                            if color:
                                if color_size == 3:
                                    l[4] = int(l[4]*255)
                                    l[5] = int(l[5]*255)
                                    l[6] = int(l[6]*255)
                                    l[7] = int(l[7]*255)

                                    image.im.putpixel(  (int(l[0]), int(l[1])), (int(l[4]),int(l[5]),int(l[6]), int(l[7]))  )
                                else:
                                    if isinstance(color_map[int(l[0])][int(l[1])], np.ndarray)==False:
                                        color_map[int(l[0])][int(l[1])] = np.array([l[4], l[5], l[6], l[7]])
                                        l[4] = int(l[4]*255)
                                        l[5] = int(l[5]*255)
                                        l[6] = int(l[6]*255)
                                        l[7] = int(l[7]*255)
                                        image.im.putpixel(  (int(l[0]), int(l[1])), (int(l[4]),int(l[5]),int(l[6]), int(l[7]))  )

                                    else:
                                        d_c = color_map[int(l[0])][int(l[1])]
                                        s_c = l[4:8]
                                        a_coef = s_c[-1] + d_c[-1]*(1-s_c[-1])
                                        r = ((s_c[-1])*s_c[0] + ((1-s_c[-1])*d_c[-1])*d_c[0])/a_coef
                                        g = ((s_c[-1])*s_c[1] + ((1-s_c[-1])*d_c[-1])*d_c[1])/a_coef
                                        b = ((s_c[-1])*s_c[2] + ((1-s_c[-1])*d_c[-1])*d_c[2])/a_coef
                                        color_map[int(l[0])][int(l[1])] = np.array([r, g, b, a_coef])
                                        new_r = int(r*255) 
                                        new_g = int(g*255)
                                        new_b = int(b*255)
                                        a_coef = int(a_coef*255)

                                        image.im.putpixel(  (int(l[0]), int(l[1])), (int(new_r),int(new_g),int(new_b), int(a_coef))  )
                            elif texture_file!=None:
                                im = image.open(texture_file)
                                rgba_im = im.convert('RGBA')
                                w,h = im.size
                                s = int(w*l[8])
                                t = int(h*l[9])
                                r,g,b,a = rgba_im.getpixel((s,t))
                                image.im.putpixel(  (int(l[0]), int(l[1])), (r,g,b,a)  )
                    else:

                        if color:
                            if color_size == 3:

                                l[4] = int(l[4]*255)
                                l[5] = int(l[5]*255)
                                l[6] = int(l[6]*255)
                                l[7] = int(l[7]*255)
                                image.im.putpixel(  (int(l[0]), int(l[1])), (int(l[4]),int(l[5]),int(l[6]), int(l[7]))  )
                            else:
                                if isinstance(color_map[int(l[0])][int(l[1])], np.ndarray)==False:
                                    color_map[int(l[0])][int(l[1])] = np.array([l[4], l[5], l[6], l[7]])
                                    l[4] = int(l[4]*255)
                                    l[5] = int(l[5]*255)
                                    l[6] = int(l[6]*255)
                                    l[7] = int(l[7]*255)
                                    image.im.putpixel(  (int(l[0]), int(l[1])), (int(l[4]),int(l[5]),int(l[6]), int(l[7]))  )

                                else:
                                    d_c = color_map[int(l[0])][int(l[1])]
                                    s_c = l[4:8]
                                    a_coef = s_c[-1] + d_c[-1]*(1-s_c[-1])
                                    r = ((s_c[-1])*s_c[0] + ((1-s_c[-1])*d_c[-1])*d_c[0])/a_coef
                                    g = ((s_c[-1])*s_c[1] + ((1-s_c[-1])*d_c[-1])*d_c[1])/a_coef
                                    b = ((s_c[-1])*s_c[2] + ((1-s_c[-1])*d_c[-1])*d_c[2])/a_coef
                                    color_map[int(l[0])][int(l[1])] = np.array([r, g, b, a_coef])
                                    new_r = int(r*255) 
                                    new_g = int(g*255)
                                    new_b = int(b*255)
                                    a_coef = int(a_coef*255)

                                    image.im.putpixel(  (int(l[0]), int(l[1])), (int(new_r),int(new_g),int(new_b), int(a_coef))  )
                        elif texture_file!=None:
                                im = image.open(texture_file)
                                rgba_im = im.convert('RGBA')
                                w,h = im.size
                                s = int(w*l[8])
                                t = int(h*l[9])
                                r,g,b,a = rgba_im.getpixel((s,t))
                                image.im.putpixel(  (int(l[0]), int(l[1])), (r,g,b,a)  )
                    count +=1


        x_coor = x_hold
        y_coor = y_hold
        z_coor = z_hold
        w_coor = w_hold



    elif "drawElementsTriangles" in word:                           # core

        x_hold = [i for i in x_coor]
        y_hold = [i for i in y_coor]
        z_hold = [i for i in z_coor]
        w_hold = [i for i in w_coor]

        if isinstance(matrix, np.ndarray) != False:


            for i in range(len(x_coor)):

                hold = np.array([x_coor[i], y_coor[i],z_coor[i], w_coor[i] ]).reshape(-1,1)
                result = np.matmul(matrix, hold)

                x_coor[i] = result[0]
                y_coor[i] = result[1]
                z_coor[i] = result[2]
                w_coor[i] = result[3]

        for i in range(len(x_coor)):
            x_coor[i] = ((x_coor[i]+w_coor[i])) * width/(2*w_coor[i])
            y_coor[i] = ((y_coor[i]+w_coor[i])) * height/(2*w_coor[i])
            z_coor[i] = z_coor[i]/w_coor[i]
            w_coor[i] = 1/w_coor[i]
        if color == False:
            red = [0 for i in range(len(x_coor))]
            blue = [0 for i in range(len(x_coor))]
            green = [0 for i in range(len(x_coor))]
            alpha = [1 for i in range(len(x_coor))]
        if texture_file == None:

            texcoord_s = [0 for i in range(len(x_coor))]
            texcoord_t = [0 for i in range(len(x_coor))]
        req = word.split()
        count = int(int(req[1])/3)
        offset = int(req[2])
        for i in range(int(count)):

            p = int(element_array[offset+3*i])
            p1 = int(element_array[offset+3*i])
            p2 = int(element_array[offset+3*i+1])
            p3 =int(element_array[offset+3*i+2])

            if hyp:
                pt1 = [x_coor[p1], y_coor[p1], z_coor[p1], w_coor[p1], red[p1]*w_coor[p1], 
                   green[p1]*w_coor[p1], blue[p1]*w_coor[p1], alpha[p1]*w_coor[p1],
                   texcoord_s[p1]*w_coor[p1], texcoord_t[p1]*w_coor[p1]]
                   
                pt2 = [x_coor[p2], y_coor[p2], z_coor[p2], w_coor[p2], red[p2]*w_coor[p2], 
                   green[p2]*w_coor[p2], blue[p2]*w_coor[p2], alpha[p2]*w_coor[p2],
                   texcoord_s[p2]*w_coor[p2], texcoord_t[p2]*w_coor[p2]]
            
                pt3 = [x_coor[p3], y_coor[p3], z_coor[p3], w_coor[p3], red[p3]*w_coor[p3], 
                   green[p3]*w_coor[p3], blue[p3]*w_coor[p3], alpha[p3]*w_coor[p3],
                   texcoord_s[p3]*w_coor[p3], texcoord_t[p3]*w_coor[p3]]
            else:
                print("no hyp")
                pt1 = [x_coor[p1], y_coor[p1], z_coor[p1], w_coor[p1], red[p1], 
                   green[p1], blue[p1], alpha[p1],
                   texcoord_s[p1], texcoord_t[p1]]
                   
                pt2 = [x_coor[p2], y_coor[p2], z_coor[p2], w_coor[p2], red[p2], 
                   green[p2], blue[p2], alpha[p2],
                   texcoord_s[p2], texcoord_t[p2]]
            
                pt3 = [x_coor[p3], y_coor[p3], z_coor[p3], w_coor[p3], red[p3], 
                   green[p3], blue[p3], alpha[p3],
                   texcoord_s[p3], texcoord_t[p3]]
            
            
            total_pts = scanline.scanline(pt1, pt2, pt3)
            counter = 0
            for j in total_pts:
                for l in j:
                    if ((int(l[0]) >= width) | (int(l[1]) >= height)):
                        continue
                    if hyp:
                        l[4] = l[4]/l[3]
                        l[5] = l[5]/l[3]
                        l[6] = l[6]/l[3]
                        l[7] = l[7]/l[3]
                        l[8] = l[8]/l[3]
                        l[9] = l[9]/l[3]

                    if sRGB & color:
                        if l[4]  <= 0.0031308:
                            l[4] = l[4]*12.95
                        else:
                            l[4] = (1.055*l[4]**(1/2.4) )- 0.055

                        if l[5]  <= 0.0031308:
                            l[5] = l[5]*12.95
                        else:
                            l[5] = (1.055*l[5]**(1/2.4) )- 0.055

                        if l[6]  <= 0.0031308:
                            l[6] = l[6]*12.95
                        else:
                            l[6] = (1.055*l[6]**(1/2.4) )- 0.055


                    if ((l[8] > 1) | (l[8] < 0)):
                        l[8] = l[8]-math.floor(l[8])
                    
                    if ((l[9] > 1) | (l[9] < 0)):
                        l[9] = l[9]-math.floor(l[9])

                    if depth:
                        if l[2] <= z_buffer[int(l[0])][int(l[1])]:
                            z_buffer[int(l[0])][int(l[1])] = l[2]

                            if color:
                                if color_size == 3:
                                    l[4] = int(l[4]*255)
                                    l[5] = int(l[5]*255)
                                    l[6] = int(l[6]*255)
                                    l[7] = int(l[7]*255)
                                    image.im.putpixel(  (int(l[0]), int(l[1])), (int(l[4]),int(l[5]),int(l[6]), int(l[7]))  )
                                else:
                                    if isinstance(color_map[int(l[0])][int(l[1])], np.ndarray)==False:
                                        color_map[int(l[0])][int(l[1])] = np.array([l[4], l[5], l[6], l[7]])
                                        l[4] = int(l[4]*255)
                                        l[5] = int(l[5]*255)
                                        l[6] = int(l[6]*255)
                                        l[7] = int(l[7]*255)
                                        image.im.putpixel(  (int(l[0]), int(l[1])), (int(l[4]),int(l[5]),int(l[6]), int(l[7]))  )

                                    else:
                                        d_c = color_map[int(l[0])][int(l[1])]
                                        s_c = l[4:8]
                                        a_coef = s_c[-1] + d_c[-1]*(1-s_c[-1])
                                        r = ((s_c[-1])*s_c[0] + ((1-s_c[-1])*d_c[-1])*d_c[0])/a_coef
                                        g = ((s_c[-1])*s_c[1] + ((1-s_c[-1])*d_c[-1])*d_c[1])/a_coef
                                        b = ((s_c[-1])*s_c[2] + ((1-s_c[-1])*d_c[-1])*d_c[2])/a_coef
                                        color_map[int(l[0])][int(l[1])] = np.array([r, g, b, a_coef])
                                        new_r = int(r*255) 
                                        new_g = int(g*255)
                                        new_b = int(b*255)
                                        a_coef = int(a_coef*255)

                                        image.im.putpixel(  (int(l[0]), int(l[1])), (int(new_r),int(new_g),int(new_b), int(a_coef))  )
                            elif texture_file!=None:
                                im = Image.open(texture_file)
                                rgba_im = im.convert('RGBA')
                                w,h = im.size

                                s = int(w*l[8])
                                t = int(h*l[9])

                                r,g,b,a = rgba_im.getpixel((s,t))
                                image.im.putpixel(  (int(l[0]), int(l[1])), (r,g,b,a)  )
                    else:

                        if color:
                            if color_size == 3:
                                l[4] = int(l[4]*255)
                                l[5] = int(l[5]*255)
                                l[6] = int(l[6]*255)
                                l[7] = int(l[7]*255)
                                image.im.putpixel(  (int(l[0]), int(l[1])), (int(l[4]),int(l[5]),int(l[6]), int(l[7]))  )
                            else:
                                if isinstance(color_map[int(l[0])][int(l[1])], np.ndarray)==False:
                                    color_map[int(l[0])][int(l[1])] = np.array([l[4], l[5], l[6], l[7]])
                                    l[4] = int(l[4]*255)
                                    l[5] = int(l[5]*255)
                                    l[6] = int(l[6]*255)
                                    l[7] = int(l[7]*255)
                                    image.im.putpixel(  (int(l[0]), int(l[1])), (int(l[4]),int(l[5]),int(l[6]), int(l[7]))  )

                                else:
                                    d_c = color_map[int(l[0])][int(l[1])]
                                    s_c = l[4:8]
                                    a_coef = s_c[-1] + d_c[-1]*(1-s_c[-1])
                                    r = ((s_c[-1])*s_c[0] + ((1-s_c[-1])*d_c[-1])*d_c[0])/a_coef
                                    g = ((s_c[-1])*s_c[1] + ((1-s_c[-1])*d_c[-1])*d_c[1])/a_coef
                                    b = ((s_c[-1])*s_c[2] + ((1-s_c[-1])*d_c[-1])*d_c[2])/a_coef
                                    color_map[int(l[0])][int(l[1])] = np.array([r, g, b, a_coef])
                                    new_r = int(r*255) 
                                    new_g = int(g*255)
                                    new_b = int(b*255)
                                    a_coef = int(a_coef*255)

                                    image.im.putpixel(  (int(l[0]), int(l[1])), (int(new_r),int(new_g),int(new_b), int(a_coef))  )

                        elif texture_file!=None:
                                im = image.open(texture_file)
                                rgba_im = im.convert('RGBA')
                                w,h = im.size
                                s = int(w*l[8])
                                t = int(h*l[9])
                                r,g,b,a = rgba_im.getpixel((s,t))
                                image.im.putpixel(  (int(l[0]), int(l[1])), (r,g,b,a)  )
                    counter +=1


        x_coor = x_hold
        y_coor = y_hold
        z_coor = z_hold
        w_coor = w_hold


    elif "drawArraysPoints" in word:                           # core
        req = word.split()
        first = word[1]
        count = word[2]

image.save(filename)

