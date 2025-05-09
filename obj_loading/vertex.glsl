#version 300 es

layout(location=0) in vec4 position;
layout(location=1) in vec4 color;
layout(location=2) in vec3 normal;

uniform mat4 mv;
uniform mat4 p;
uniform mat4 ma;

out vec3 vNormal;
out vec4 vColor;

void main() {

    vColor = color;
    vNormal = normal;
    //gl_Position = p*mv*position;
    mat4 m = mat4(1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.5, 0.5, 0.5, 1.0 );
    gl_Position = p*mv*position;
    //gl_Position = m*position;

}
