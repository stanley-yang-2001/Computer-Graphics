#version 300 es
precision highp float;

in vec3 vNormal;
in vec4 vColor;
out vec4 fragColor;

uniform mat4 m;
uniform vec3 lightdir;
uniform vec3 halfway;

uniform vec3 lightdir2;
uniform vec3 halfway2;

void main() {


    //fragColor = vColor;
    //fragColor = vec4(vNormal, 1);

    
    vec3 n = normalize(vNormal);
    float lambert = max(dot(n, lightdir),0.1);
    //float lambert = dot(n, lightdir);
    float blinn = pow(max(dot(n, mat3(m)*halfway*1.2),0.0), 5.0);

    float lambert2 = max(dot(n, lightdir2), 0.0);
    float blinn2 = pow(max(dot(n, mat3(m)*halfway2*0.9999), 0.0), 80.0);

    fragColor = vec4(vColor.rgb*(lambert*vec3(1.0,1.0,1.0) + lambert2*vec3(1.0, 1.0, 1.0))
                    +(vec3(1.0, 1.0, 1.0)*blinn+vec3(1.0, 1.0, 1.0)*blinn2), 
                    vColor.a);
}
