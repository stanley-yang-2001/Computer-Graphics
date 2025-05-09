import numpy as np

class RaySphereObject:
    def __init__(self, center, radius, color, type, vertices = []):
        #self.ro = ro
        #self.rd = rd
        self.center = center
        self.radius = radius
        self.color = color
        self.sun = []
        self.sunColor = []
        self.bulb = []
        self.bulbColor = []
        self.checkColor=[]
        self.lambertColor = []
        self.rd = 0
        self.type = type
        self.vertices = vertices
        self.bulbPoint = None

    def setColor(self, color):
        self.color = color

    def setCenter(self, center):
        self.center = center
    def setRadius(self, radius):
        self.radius = radius

    def setRd(self, rd):
        self.rd = rd
    def addSun(self, sundir):
        self.sun.append(sundir)

    def addSunColor(self, sunlight):
        self.sunColor.append(sunlight)
    
    def addBulb(self, bulb):
        self.bulb.append(bulb)

    def addBulbColor(self, bulbcolor):
        self.bulbColor.append(bulbcolor)

    def setLightColor(self, normal, status=False):
        total_color = np.array([0.0,0.0,0.0])

        if status:
            print(f"\namount of sun: ", len(self.sun))
        #print("sun length: ",len(self.sun))
        #print("suncolor length: ",len(self.sunColor))
        for i in range(len(self.sun)):
            if (np.all(np.dot(self.rd,normal)>0)):
                normal = -1*normal
                if status:
                    print("reflected")
            lambert = max(0,np.dot(normal, self.sun[i]))
            total_color+=(self.color*self.sunColor[i]*lambert)
            if status:
                print(f"normal: {normal}, sun_dir: {self.sun[i]}")
                print(f"{self.color}*{self.sunColor[i]}*{lambert}")
                print(f"{self.color}*{self.sunColor[i]} = {self.color*self.sunColor[i]}")
                print("total color: ", total_color)
        
        if status:
            print("amount og bulb: ",len(self.bulb))

        for j in range(len(self.bulb)):
            if (np.all(np.dot(self.rd,normal)>0)):
                normal = -1*normal
                if status:
                    print("reflected")
            
            dist2 = np.square(np.linalg.norm((self.bulb[j]-self.bulbPoint)))
            light_dir = (self.bulb[j]-self.bulbPoint)/np.linalg.norm((self.bulb[j]-self.bulbPoint))
            if status:
                print("distance squared: ", dist2)
                print("bulbPoint: ", self.bulbPoint)
                print("color: ", self.bulbColor[j])
            #lambert = max(0,np.dot(normal, (self.bulb[j])/dist2))
            lambert = max(0,np.dot(normal, light_dir))/dist2
            total_color+=(self.color*self.bulbColor[j]*lambert)
            if status:
                    print("bulb check")
                    print(f"normal: {normal}, bulb: {self.bulb[j]}")
                    print(f"distance {self.bulbPoint-self.bulb[j]}")
                    print(f"{self.color}*{self.bulbColor[j]}*{lambert} = {(self.color*self.bulbColor[j]*lambert)}")
                    print(f"{self.color}*{self.bulbColor[j]} = {self.color*self.bulbColor[j]}")
                    print("total color: ", total_color)
        self.checkColor = total_color.copy()

        self.lambertColor = total_color.copy()

    def clearSun(self):
        self.sun.clear()
        self.sunColor.clear()
    def clearBulb(self):
        self.bulb.clear()
        self.bulbColor.clear()
        self.bulbPoint = None

    def addBulbPoint(self, point):
        self.bulbPoint = point
        



    