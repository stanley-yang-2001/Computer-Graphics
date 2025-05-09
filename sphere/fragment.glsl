#version 300 es
precision highp float;

in vec3 vNormal;
out vec4 fragColor;

uniform vec4 color;
uniform mat4 m;
uniform vec3 lightdir;
uniform vec3 halfway;

void main() {
    /*
    float lambert = max(dot(vNormal, lightdir),0.5);
    fragColor = vec4(vColor.rgb*lambert, vColor.a);*/

    
    vec3 n = normalize(vNormal);
    float lambert = max(dot(n, lightdir),0.0);
    //float lambert = dot(n, lightdir);
    float blinn = pow(max(dot(n, mat3(m)*halfway*0.667),0.0), 160.0);
    fragColor = vec4(color.rgb*lambert
                    +vec3(1,1,1)*blinn, 
                    color.a);

    //fragColor = color;
    //fragColor = vec4(vNormal,1.0);

}
