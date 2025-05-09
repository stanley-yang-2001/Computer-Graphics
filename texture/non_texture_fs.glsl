#version 300 es
precision highp float;

in vec3 vNormal;
//in vec4 vColor;
out vec4 fragColor;

uniform mat4 m;
uniform vec3 lightdir;
uniform vec3 halfway;

uniform vec4 color;

void main() {
    /*
    float lambert = max(dot(vNormal, lightdir),0.5);
    fragColor = vec4(vColor.rgb*lambert, vColor.a);*/

    
    vec3 n = normalize(vNormal);
    float lambert = max(dot(n, lightdir),0.0)*(1.0-color.a);
    //float lambert = dot(n, lightdir);
    float blinn = pow(max(dot(n, halfway),0.0), 80.0)*(3.0*color.a);
    fragColor = vec4(color.rgb*lambert
                    +vec3(1,1,1)*blinn, 
                    1);
}
