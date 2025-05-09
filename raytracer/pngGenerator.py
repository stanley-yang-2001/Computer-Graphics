from PIL import Image
import sys
import numpy as np
import math
import raysphere
import RaySphereObject
import random



filename = ""
color = np.array([1.0,1.0,1.0])


draw = 0
width = 0
height = 0
value = 0
# initial setup
eye = np.array([0,0,0])     # eye
forward = np.array([0,0,-1])    # forward
right = np.array([1,0,0])     # right
up = np.array([0,1,0])     # up
up_input = np.array([0,0,0])

# 6.2 mode setting
fisheye = False
panorama = False

# sphere
x = 0
y = 0
z = 0
radius = 0
sphere_center = np.array([x,y,z])
objects = []

z_buffer = None

coor = []
# 6.4
# sun
sun_available = False
sunlight = []
suncolors = []

# exposure
expose = False
v = None

# plane
plane_available = False
planes = []
plane_point = 0
plane_normal = np.array([0,0,0])

# triangles
vertices = []

# bulbs
bulbSource = []
bulbColor = []

bounces = 4
# uniform state
texture_file = None

# buffer povision
position_size = 0
color_size = 0
texcoord_size = 2
texcoord_s = 0
texcoord_t = 0

# aa
aa_available = False
aa_n = None
aa_rays = []
aa_objects = []


file= sys.argv[1]
f = open(file, "r")
#image = Image.new("RGBA", (width, height), (0,0,0,0))
image = None


for word in f:

    # 6.1 PNG
    if "png" ==word[0:3]:
        dimension = word.split()
        width = int(dimension[1])
        height = int(dimension[2])
        filename = dimension[-1]
        image = Image.new("RGBA", (width, height), (0,0,0,0))
        z_buffer = np.full((width, height), -1000.0, dtype=float)
    # 6.2 Mode setting

    elif "bounces" in word:                                      # core
        req = word.split()
        d = int(req[1])

    elif "forward" in word:

        req = word.split()
        forward = np.array([float(req[1]), float(req[2]), float(req[3])])
        right = np.cross(forward, up)
        up = np.cross(right,forward)
    
    elif "panorama" in word:
        panorama = True
    
    elif "fisheye" in word:
        fisheye = True
        

    elif "up" in word:
        req = word.split()
   
        up_input = np.array([float(req[1]), float(req[2]), float(req[3])])
        right = np.cross(forward, up_input)/np.linalg.norm(np.cross(forward, up_input))

        up = np.cross(right,forward)/np.linalg.norm(np.cross(right,forward))

    
    elif "eye" in word:
        req = word.split()
        eye = np.array([float(req[1]), float(req[2]), float(req[3])])


    elif "expose" in word:
        req = word.split()
        expose = True
        v = float(req[1])
    
    elif "aa" in word:
        req = word.split()
        aa_available = True
        aa_n = int(req[1])






    # 6.3 state setting

    elif "texture" in word:
        texture_option = word.split()
        texture_file = texture_option[-1]

    elif "color" in word:
        req = word.split()
        r = float(req[1])
        g = float(req[2])
        b = float(req[3])
        color = np.array([r,g,b])
        print("new color set: ", color, "\n")

    
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


    # 6.4 geometry

    elif "sphere" in word:
        print("sphere reached")
        req = word.split()
        x = float(req[1])
        y = float(req[2])
        z = float(req[3])
        radius = float(req[4])
        sphere_center = np.array([x,y,z])
        print(sphere_center)
        print(radius)
        origin = eye
        print("color: ",color)
        obj = RaySphereObject.RaySphereObject(sphere_center, radius, color.copy(), "sphere")
        '''if sun_available:
            for i in range(len(sunlight)):
                obj.addSun(sunlight[i])
                obj.addSunColor(suncolors[i])'''
        objects.append(obj)
    
    elif "sun" in word:
        sun_available = True
        req = word.split()
        sunlight_dir = np.array([float(req[1]), float(req[2]), float(req[3])])
        print(sunlight_dir)
        sun_dir_normalize=sunlight_dir/np.linalg.norm(sunlight_dir)
        sunColor = color.copy()
        sunlight.append(sun_dir_normalize)
        suncolors.append(sunColor)
        '''for i in objects:
            i.addSun(sun_dir_normalize)
            i.addSunColor(sunColor)'''
    
    elif "bulb" in word:
        req = word.split()
        bulb_location = np.array([float(req[1]), float(req[2]), float(req[3])])
        bulb_color = color.copy()
        bulbSource.append(bulb_location)
        bulbColor.append(bulb_color)
        print("bulb")
    
    elif "plane" in word:
        plane_available = True
        req = word.split()
        A = float(req[1])
        B = float(req[2])
        C = float(req[3])
        D = float(req[4])
        plane_normal = np.array([A,B,C])
        plane_point = (-1*D*plane_normal)/(np.square(A)+np.square(B)+np.square(C))
        obj = RaySphereObject.RaySphereObject(plane_point, plane_normal, color.copy(), "plane")
        objects.append(obj)
    
    elif "xyz" in word:
        req = word.split()
        v = np.array([float(req[1]), float(req[2]), float(req[3]), texcoord_s, texcoord_t])
        vertices.append(v)
    
    elif "tri" in word:
        req = word.split()
        if int(req[1]) > 0:
            ind_1 = int(req[1])-1
        else:
            ind_1 = int(req[1])
        if int(req[2]) > 0:
            ind_2 = int(req[2])-1
        else:
            ind_2 = int(req[2])
        if int(req[3]) > 0:
            ind_3 = int(req[3])-1
        else:
            ind_3 = int(req[3])
        obj = RaySphereObject.RaySphereObject(None, None, color.copy(), type = "triangle", vertices=[vertices[ind_1], vertices[ind_2], vertices[ind_3]])
        print("obj's vertice: ", obj.vertices)
        print("vertices: ",[vertices[ind_1], vertices[ind_2], vertices[ind_3]])
        objects.append(obj)


count = 0


for x in range(width):
    status = False
    for y in range(height):
        if ((x == 45) & (y ==60)):  # top plane non black
            status = True
            print(f"status: ({x}, {y})")
        '''elif ((x == 20) & (y ==44)): # top plane black
            status = True
            print(f"status: ({x}, {y})")
        
        elif ((x == 70) & (y ==35)):
            status = True'''
        '''elif ((x == 50) & (y ==86)):
            status = True'''
        holdx = x
        holdy = y
        
        sx = 0
        sy = 0
        if panorama:
            
            lat_per_pixel = 180/height
            lon_per_pixel = 360/width
            new_y = 90-(y*lat_per_pixel)
            new_x = -180+(x*lon_per_pixel)
            if status:
                print(f"new x and y: ({new_x},{new_y})")
                print(f"old x and y: ({x},{y})")
            #x,y = new_x, new_y

            sx = (2*x-180)/360
            sy = (90-2*y)/180
            #sx = x/width
            #sy = y/height

        else:
            sx = (2*x-width)/max(width, height)
            sy = (height-2*y)/max(width, height)
        x = holdx
        y = holdy

        origin = eye
        direction = 0
        if fisheye:
            direction = np.sqrt(1-np.square(sx)-np.square(sy))*forward+(sx*(right/np.linalg.norm(right)))+(sy*(up/np.linalg.norm(up)))
        else:
            direction = forward+(sx*(right/np.linalg.norm(right)))+(sy*(up/np.linalg.norm(up)))
        direction_normalized = direction/np.linalg.norm(direction)
        result = None
        t = 9999
        pt_to_draw = None
        sphere = None
        plane = None
        aa_pass = False
        for item in objects:                        # also includes plane

            if panorama:
                longitude = (x / width) * 360 - 180
                latitude = 90 - (y / height) * 180

                # Convert latitude and longitude to radians
                lambda_rad = math.radians(longitude)
                phi_rad = math.radians(latitude)

                # Spherical to Cartesian coordinates
                sx = math.cos(phi_rad) * math.cos(lambda_rad)
                sy = math.sin(phi_rad)
                d_z = math.cos(phi_rad) * math.sin(lambda_rad)
                direction = d_z*forward+(sx*(right/np.linalg.norm(right)))+(sy*(up/np.linalg.norm(up)))
                direction_normalized = direction/np.linalg.norm(direction)
                if item.type == "plane":
                    result = raysphere.ray_plane_intersection(origin, direction_normalized, item.center,item.radius)
                elif item.type == "triangle":
                    result = raysphere.ray_triangle_intersection(origin, direction_normalized, np.array([sx,sy,-2]),item.vertices)
                else:
                    result = raysphere.ray_sphere_intersection(origin, direction_normalized, item.center,item.radius)

            else:
                if item.type == "plane":
                    result = raysphere.ray_plane_intersection(origin, direction_normalized, item.center,item.radius)
                elif item.type == "triangle":
                    result = raysphere.ray_triangle_intersection(origin, direction_normalized, np.array([sx,sy,-2]),item.vertices)
                else:
                    result = raysphere.ray_sphere_intersection(origin, direction_normalized, item.center,item.radius)


            if (len(result)!=0):
                if ((result[0]>0) and (result[0]<t)):       # choose point with smallest positive t
                    t = result[0]
                    pt_to_draw = result[1]
                    sphere = item
                    if status:
                        print(f"here {item.center}")
        if (sphere !=None):
            if status:
                print(f"here {sphere.center}")
            sphere_center = sphere.center
            radius        = sphere.radius
            '''if (sun_available == False):
                image.im.putpixel(  (int(x), int(y)), (0, 0, 0)  )
            else:'''
            '''if plane_available:
                for p in planes:
                    plane_result = raysphere.ray_plane_intersection(origin, direction_normalized, p.point, p.normal)
                    if (len(plane_result)!=0):
                        if ((plane_result[0]>0) and (plane_result[0]<t)):       # choose point with smallest positive t
                            t = plane_result[0]
                            pt_to_draw = plane_result[1]
                            plane = p '''
            shadow_check = False
            shadow_rays = []
            shadow_rays_bulbs = []
            safe = 0
            for i in range(len(sunlight)):
                shadow_rays.append([pt_to_draw, sunlight[i], suncolors[i]])
                if status:
                    print([pt_to_draw, sunlight[i], suncolors[i]])
            for i in range(len(bulbSource)):
                shadow_rays_bulbs.append([pt_to_draw, bulbSource[i], bulbColor[i]])

                # for each ray, check if it hits something, if it hits anything, then we don't add the sun_Dir and suncolor
                # once secondary ray is done, we perform lambert calculation with the raysphere
                # problem, some part of other two sphere is too green 
            shadow_count = 0

            for i in shadow_rays:
                for o in objects:
                    if (o != sphere):
                        shadow_count +=1
                        if o.type == "plane":
                            result1 = raysphere.ray_plane_intersection(i[0], i[1], o.center,o.radius)
                            if status:
                                print("ray-plane's point: ",sphere.center)
                        elif o.type == "triangle":
                            result1 = raysphere.ray_triangle_intersection(i[0], i[1], np.array([sx, sy, -2]),o.vertices)
                        else:
                            result1 = raysphere.ray_sphere_intersection(i[0], i[1], o.center,o.radius)

                        if (len(result1)==0):               # nothing between ray and light source
                            safe +=1
                            if status:
                                print("object didn't hit")
                        else:                               # hit an object between ray and light source
                            if (sphere.type == "plane") & (o.type == "plane"):   # ignore plane-plane shadow intersection
                                safe +=1
                            else:
                                safe = 0
                                if status:
                                    print("object hit something")
                                    print("what's hit: ",o.type)
                                    print("onject's point: ",o.center)
                                break
                    if(safe == len(objects)-1):
                        sphere.addSun(i[1])
                        sphere.addSunColor(i[2])
                        if status:
                            print("nothing hit, safe to add sun for object")
                        safe = 0
            for i in shadow_rays_bulbs:
                for o in objects:
                    if (o != sphere):
                        light_dir = (i[1]-i[0])/np.linalg.norm((i[1]-i[0]))
                        shadow_count +=1
                        if o.type == "plane":
                            result1 = raysphere.ray_plane_intersection(i[0], light_dir, o.center,o.radius)
                            if status:
                                print("ray-plane's point: ",sphere.center)
                        elif o.type == "triangle":
                            result1 = raysphere.ray_triangle_intersection(i[0], light_dir, np.array([sx, sy, -2]),o.vertices)
                        else:
                            result1 = raysphere.ray_sphere_intersection(i[0], light_dir, o.center,o.radius)

                        if (len(result1)==0):               # nothing between ray and light source
                            safe +=1
                            if status:
                                print("object didn't hit")
                        else:
                                                           # hit an object between ray and light source
                            if status:
                                print("check: ", o.center[2])
                            if (sphere.type == "plane") & (o.type == "plane"):   # ignore plane-plane shadow intersection
                                safe +=1
                            #elif o.center[2]==i[1][2]:
                            elif np.linalg.norm((i[1]-i[0])) < np.linalg.norm((result1[1]-i[0])):
                                safe +=1
                            else:
                                safe = 0
                                if status:
                                    print("object hit something")
                                    print("what's hit: ",o.type)
                                    print("onject's point: ",o.center)
                                break
                    if(safe == len(objects)-1):
                        #sphere.addBulb(i[1]-i[0])
                        sphere.addBulb(i[1])
                        sphere.addBulbColor(i[2])
                        sphere.addBulbPoint(i[0])
                        if status:
                            print("nothing hit, safe to add bulb for object")
                            print("bulb's color: ", i[2])
                        safe = 0
                
            if status:
                print("type: ", sphere.type)
                print("shadow count: ",shadow_count)

                        

            sphere.setRd(direction_normalized)
            if sphere.type == "sphere":
                surf_normal = (pt_to_draw-sphere_center)/np.linalg.norm((pt_to_draw-sphere_center))
                if status:
                    print("true")
            elif sphere.type == "triangle":
                edge1 = sphere.vertices[1][0:3] - sphere.vertices[0][0:3]         
                edge2 = sphere.vertices[2][0:3] - sphere.vertices[0][0:3]         
                surf_normal = np.cross(edge1, edge2)
            else:
                surf_normal = radius/np.linalg.norm(radius)
            if status:
                print("check color ",sphere.color)
            sphere.setLightColor(surf_normal, status)
            if status:
                print("check color after lambert",sphere.color)
            if len(sphere.sun)==0 and len(sphere.bulb)==0:
                color = np.array([0,0,0])
            else:
                l_color = sphere.lambertColor.copy()
                color = sphere.lambertColor.copy()
            if status:
                print("before exposure ",color)
            if expose:
                color[0] = 1-np.pow(np.exp(1), (-1*v*color[0]))
                color[1] = 1-np.pow(np.exp(1), (-1*v*color[1]))
                color[2] = 1-np.pow(np.exp(1), (-1*v*color[2]))

            if status:
                print("after exposure ",color)
            # sRGB conversion
            if color[0]  <= 0.0031308:
                color[0] = color[0]*12.95
            else:
                color[0] = (1.055*color[0]**(1/2.4) )- 0.055

            if color[1]  <= 0.0031308:
                color[1] = color[1]*12.95
            else:
                color[1] = (1.055*color[1]**(1/2.4) )- 0.055

            if color[2]  <= 0.0031308:
                color[2] = color[2]*12.95
            else:
                color[2] = (1.055*color[2]**(1/2.4) )- 0.055
            #print(color[0]*255)
            for i in range(len(color)):
                if color[i] > 1:
                    color[i] == 1
                elif color[i] < 0:
                    color[i] = 0 
            if status:
                print("after exposure and sRGB",color*255)

            r = int(color[0]*255) 
            g = int(color[1]*255)
            b = int(color[2]*255)
            if status:
                print(f"pixel ({x},{y})")
                print(f"Ray origin: {origin}")
                print(f"Ray direction: {direction_normalized}")
                print(f"Intersection depth: {t}")
                print(f"Intersection point: {pt_to_draw}")
                print(f"Surface normal: {surf_normal}")
                if (len(sphere.sun)>0):
                    print(f"Sun direction: {sphere.sun[0]}")
                    print(f"Lambert dot product: {np.dot(surf_normal,sphere.sun[0])}")
                print(f"check color: {sphere.checkColor}")
                print(f"Linear color: {color}")
                print(f"sRGB color: ({r}, {g}, {b})")
                print("")

            image.im.putpixel(  (int(x), int(y)), (r,g,b)  )

            count +=1
            sphere.clearSun()
            sphere.clearBulb()
        sphere = None
        status = False
    


print("pixel drawn: ", count)
image.save(filename)

