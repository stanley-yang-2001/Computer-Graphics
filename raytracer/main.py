import numpy as np


e = np.array([0,0,0])     # eye
f = np.array([0,0,-1])    # forward
r = np.array([1,0,0])     # right
u = np.array([0,1,0])     # up




up_input = np.array([0 ,-1 ,2])
#up_input = np.array([0 ,-1 ,2])/np.linalg.norm(np.array([0 ,-1 ,2]))
eye = np.array([0.3, -0.5, -3])
forward = np.array([-0.5, 0.3,2])
right = np.cross(forward, up_input)/np.linalg.norm(np.cross(forward, up_input))
up = np.cross(right,forward)/np.linalg.norm(np.cross(right,forward))




print(np.arctan2(-1,-1))
print(np.arcsin(0.5))
print(-3*np.pi/4)




