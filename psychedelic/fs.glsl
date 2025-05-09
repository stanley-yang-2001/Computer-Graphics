#version 300 es
precision highp float;
uniform float seconds;
in vec4 pos;
out vec4 color;
void main() {

     /*float r = float((cos(seconds)/2.0) + 0.50);
     float g = float((cos(seconds-1.0)/2.0) + 0.5);
     float b = float((cos(seconds+1.0)/2.0) + 0.5);*/
     //float r = float((cos(seconds)/2.0) + 0.50);
     float poly = 2.71*pow(pos.x, 7.0)-0.71*pow(pos.x, 6.0)+
               3.14*pow(pos.x, 5.0)+7.72*pow(pos.x, 5.0)+
               5.94*pow(pos.x, 4.0)-6.71*pow(pos.x, 3.0)-
               cos(2.0*pow(pos.x, 2.0))-0.39*pos.x+pos.y+seconds;

     float poly2 = pow(pos.x, 2.17)-pos.y;

     float r = float(sin(float(cos(poly)+seconds*2.71828)+seconds/0.947))/2.86 + 0.78;
     float g = (cos(poly*seconds+pos.y)+sin(seconds-poly)) + 0.27;
     float b = sin(cos(seconds*pos.x))/2.14 + 0.5;
     //float b = cos(seconds)/3.0 + 0.2;
     color = vec4(r,g,b, 1);
}
