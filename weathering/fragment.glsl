#version 300 es
precision highp float;

in vec3 vNormal;
in vec4 vColor;
out vec4 fragColor;

uniform mat4 m;
uniform vec3 lightdir;
uniform vec3 halfway;


void main() {

    
    vec3 n = normalize(vNormal);
    float lambert = max(dot(n, lightdir),0.0);
    float blinn = pow(max(dot(n, halfway),0.0), 300.0);

    
    fragColor = vec4(vColor.rgb*lambert
                    +vec3(1,1,1)*blinn, 
                    vColor.a);

}
