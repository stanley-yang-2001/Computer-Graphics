#version 300 es
layout(location=0) in vec3 position;
layout(location=1) in vec4 color;
//layout(location=2) in vec3 normal;
layout(location=2) in float radius;

uniform mat4 m;
uniform mat4 p;
uniform float viewport;
//uniform float radius;

out vec3 vNormal;
out vec4 vColor;

void main() {

    vColor = color;

    gl_Position = p*m*vec4(position,1.0);
    //gl_Position = vec4(position,1.0);
    //gl_Position = vec4(0,0,0,1.0);

    //gl_PointSize = 200.0;
    gl_PointSize = viewport*p[0][0]*1.0/gl_Position.w * radius;
    //gl_PointSize = 1.0/gl_Position.w*400;
    //gl_PointSize = radius*200.0;




}
