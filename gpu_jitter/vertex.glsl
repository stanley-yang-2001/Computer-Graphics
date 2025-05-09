#version 300 es

layout(location=0) in vec4 position;
layout(location=1) in vec4 color;

uniform float seconds;
uniform mat4 m;
out vec4 vColor;

void main() {

    float offset = (cos(seconds+float(gl_VertexID))<-0.5) ? -0.5:
                    (cos(seconds+float(gl_VertexID))<0.0) ? 0.0 : 0.5;


    vColor = color;
    /*gl_Position = vec4(position.x+cos(seconds-float(gl_VertexID)), 
                        position.y+sin(seconds+float(gl_VertexID)),
                        position.zw)*/
    //gl_Position = position;
    //gl_Position=vec4(position[0]+0.1*cos(seconds), position[1], position[2], position[3]);

    /*gl_Position = (gl_VertexID>=8) ? position :
                vec4(position[0]*cos(seconds+float(gl_VertexID)), 
                position[1]*sin(seconds-float(gl_VertexID)), 
                position[2], 
                position[3]*(cos(seconds)+2.0)/2.0);*/
    gl_Position = vec4(position[0]+0.1*cos(seconds)*offset, 
                    position[1]-0.1*sin(seconds)*offset, 
                    position[2], 
                    position[3]+0.01*cos(seconds));

}
