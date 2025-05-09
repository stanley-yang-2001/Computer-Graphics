from PIL import Image
import sys



filename = ""
red = []
green= []
blue = []
alpha = []
x_coor = []
y_coor = []

draw = 0
width = 0
height = 0
value = 0

file= sys.argv[1]
f = open(file, "r")


for word in f:
    if "png" in word:
        dimension = word.split()
        width = int(dimension[1])
        height = int(dimension[2])
        filename = dimension[-1]

    if "color 4" in word:
        color_palette = word.split()
        for x in range (2,len(color_palette)):
            if (x % 4 == 2):
                red.append(int(color_palette[x]))
            if (x % 4 == 3):
                green.append(int(color_palette[x]))
            if (x % 4 == 0):
                blue.append(int(color_palette[x]))
            if (x % 4 == 1):
                alpha.append(int(color_palette[x])) 

    if "position 2" in word:
        coordinate = word.split()
        for num in range (2,len(coordinate)):
            if (num % 2 == 0):
                x_coor.append(int(coordinate[num]))
            if (num % 2 == 1):
                y_coor.append(int(coordinate[num]))

    if "drawPixels" in word:
        req = word.split()
        draw += int(req[-1])

image = Image.new("RGBA", (width, height), (0,0,0,0))

for p in range (0, draw):
    image.im.putpixel((x_coor[p], y_coor[p]), (red[p % len(red)], green[p % len(green)], blue[p % len(blue)], alpha[p % len(alpha)]))



image.save(filename)

