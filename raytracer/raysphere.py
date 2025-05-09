import numpy as np

def ray_sphere_intersection(ro, rd, c, r):


    t = None
    pt = None

    # for vector from B to A, vector = A-B
    # step 1
    inside = np.square(np.linalg.norm(c-ro)) < r**2

    # step 2
    length = c-ro
    direction = rd/np.linalg.norm(rd)
    tc = np.dot(length, direction)

    # step 3
    if ((inside == False) & (tc < 0)):
        return []
    
    # step 4
    d2 = np.square(np.linalg.norm(ro+tc*rd-c))

    # step 5
    if ((inside == False) & (r**2 < d2)):
        return []
    
    # step 6
    toff = np.sqrt(r**2-d2)/np.linalg.norm(rd)

    # step 7
    if (inside):
        t = tc+toff         # depth
        pt = t*rd+ro        # point 
    else:
        t = tc-toff
        pt = t*rd+ro
    return [t,pt] 


    
# ray plane intersection for a ray and a plane with normal n and point p
def ray_plane_intersection(ro, rd, p, n, triangle=False):

    # step 1
    if triangle:
        const = n/np.dot(rd[0:2],n)
        t = np.dot(p-ro[0:2], const)
    else:    
        const = n/np.dot(rd,n)
        t = np.dot(p-ro, const)

    # step 2 
    if t > 0:
        if triangle:
            p1 = t*rd[0:2]+ro[0:2]
        else:
            p1 = t*rd+ro
        return [t,p1]
    return []

def ray_triangle_intersection(ro, rd, p, vectors):

    # step 1
    #print("here: ",vectors)
    edge1 = vectors[1][0:3] - vectors[0][0:3]         # v1-v0
    edge2 = vectors[2][0:3] - vectors[0][0:3]         # v2-v0
    #print(edge1)
    #print(edge2)

    # compute normal for triangle
    normal = np.cross(edge1, edge2)

    # perform ray_plane intersection
    result = ray_plane_intersection(ro,rd,p,normal)
    if len(result) == 0:
        return []
    intersect_t = result[0]
    intersect_p = result[1]


    # find area using area = triangle normal/2
    area = (np.linalg.norm(normal))/2

    # compute u
    v1_to_point = intersect_p-vectors[1][0:3]
    v1_to_v2 = vectors[2][0:3]-vectors[1][0:3]
    u_cross = np.cross(v1_to_v2, v1_to_point)
    u = (u_cross/2)/area
    if np.dot(u_cross,normal) < 0:
        return []

    # compute v
    v2_to_point = intersect_p-vectors[2][0:3]
    v2_to_v0 = vectors[0][0:3]-vectors[2][0:3]
    v_cross = np.cross(v2_to_v0, v2_to_point)
    v = (v_cross/2)/area
    if np.dot(v_cross,normal) < 0:
        return []
    
    # compute v
    v0_to_point = intersect_p-vectors[0][0:3]
    w_cross = np.cross(edge1, v0_to_point)  # edge1 is defined before
    w = 1-u-v
    if np.dot(w_cross,normal) < 0:
        return []
    result.append([u,v,w])
    
    return result
    

