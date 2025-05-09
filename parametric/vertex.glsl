#version 300 es

layout(location=0) in vec4 position;
layout(location=1) in vec4 color;
layout(location=2) in vec3 normal;

uniform mat4 m;
uniform mat4 p;

out vec3 vNormal;
out vec4 vColor;

void main() {
    
    vColor = color;
    vNormal = normal;
    gl_Position = p*m*position;



}
