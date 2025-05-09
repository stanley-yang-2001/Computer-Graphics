import dda
import numpy as np


def scanline(p1, p2, r):

    min = 1000000
    max = -1000000
    no_y1 = False
    no_y2 = False
    no_y3 = False


    top_pt = "1"
    bot_pt = "1"

    list_pt = [p1, p2, r]
    for pt in list_pt:
        if (pt[1] < min):
            min = pt[1]
            top_pt = pt
        elif (pt[1] == min):
            if abs(pt[0]) < abs(top_pt[0]):
                min = pt[1]
                top_pt = pt
        if (pt[1] > max):
            max = pt[1]
            bot_pt = pt
        elif (pt[1] == max):
            if abs(pt[0]) > abs(bot_pt[0]):
                max = pt[1]
                bot_pt = pt


    list_pt.remove(top_pt)
    list_pt.remove(bot_pt)
    mid_pt = list_pt[0]




    long_edge = dda.dda(top_pt, bot_pt, "y")

    if (isinstance(long_edge, np.ndarray)):
        long_length = len(long_edge)
    else:
        long_length = long_edge
        no_y1 = True


    short_edge = dda.dda(top_pt, mid_pt, "y")

    if (isinstance(short_edge, np.ndarray)):
        short_length = len(short_edge)
    else:
        short_length = short_edge
        no_y2 = True
    


    short2_edge = dda.dda(mid_pt, bot_pt, "y")

    if (isinstance(short2_edge, np.ndarray)):
        short2_length = len(short2_edge)
    else:
        short2_length = short2_edge
        no_y3 = True


    pixels_coor = []
    if (no_y1 & no_y2 & no_y3):
        long_edge = dda.dda(top_pt, bot_pt, "x")
        short_edge = dda.dda(top_pt, mid_pt, "x")
        short2_edge = dda.dda(mid_pt, bot_pt, "x")
        if (isinstance(long_edge, np.ndarray)):
                pixels_coor.append(long_edge)
        if (isinstance(short_edge, np.ndarray)):
                pixels_coor.append(short_edge)
        if (isinstance(short2_edge, np.ndarray)):
                pixels_coor.append(short2_edge)


    else:
        count = 0

        if (isinstance(short_edge, np.ndarray)):
            for p in short_edge:

                curr_pixels = dda.dda(long_edge[count], p, "x")
                count += 1
                if (isinstance(curr_pixels, np.ndarray) == False):
                    continue
                else:
                    pixels_coor.append(curr_pixels)
                if (count >= long_edge.shape[0]):
                    break
        else:
            pass


        new_long_edge = long_edge[count:len(long_edge)]


        count = 0
        if (isinstance(short2_edge, np.ndarray)):
            for p in short2_edge:
                curr_pixels = dda.dda(new_long_edge[count], p, "x")
                count += 1
                if (isinstance(curr_pixels, np.ndarray) == False):
                    continue
                else:
                    pixels_coor.append(curr_pixels)
                if (count >= new_long_edge.shape[0]):
                    break

        else:
            pass
    return pixels_coor