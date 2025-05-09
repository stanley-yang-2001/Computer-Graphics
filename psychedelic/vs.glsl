#version 300 es

out vec4 pos;
void main() {
    //gl_Position = vec4(1.0,1.0,0.0,1.0);
    gl_Position = (gl_VertexID == 0) ? vec4(-1,-1,0,1) : 
                    (gl_VertexID == 1) ? vec4(1,-1,0,1) : 
                    (gl_VertexID == 2) ? vec4(1,1,0,1) : 
                    (gl_VertexID == 3) ? vec4(-1,-1,0,1) : 
                    (gl_VertexID == 4) ? vec4(-1,1,0,1) : vec4(1,1,0,1);
    pos = gl_Position;
}


/*#version 300 es

void main() {
    gl_Position = (gl_VertexID == 0) ? (-1,-1,0,1) : 
                    (gl_VertexID == 1) ? (1,-1,0,1) : 
                    (gl_VertexID == 2) ? (1,1,0,1) : 
                    (gl_VertexID == 3) ? (-1,-1,0,1) : 
                    (gl_VertexID == 4) ? (-1,1,0,1) : 
                    (gl_VertexID == 5) ? (1,1,0,1);
}*/