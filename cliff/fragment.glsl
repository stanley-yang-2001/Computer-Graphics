#version 300 es
precision highp float;

in vec3 vNormal;
in vec4 vColor;
out vec4 fragColor;

uniform mat4 m;
uniform vec3 lightdir;
uniform vec3 halfway;

uniform vec4 g;
uniform vec4 r;

void main() {

    //fragColor = vec4(vNormal, 1.0); 
    /*
    float lambert = max(dot(vNormal, lightdir),0.5);
    fragColor = vec4(vColor.rgb*lambert, vColor.a);*/
    
    vec3 n = normalize(vNormal);
    float lambert = max(dot(n, lightdir),0.0);
    //float blinn = pow(max(dot(n, mat3(m)*halfway*1.0),0.0), 30.0);
    //float blinn = pow(max(dot(n, mat3(m)*halfway*1.0),0.0), 50.0);
    float blinn = pow(max(dot(n, halfway),0.0), 80.0);

    /*
    fragColor = vec4(vColor.rgb*lambert
                    +vec3(1,1,1)*blinn, 
                    vColor.a);*/
    fragColor = (vNormal.z >0.6) ? vec4(g.rgb*lambert+vec3(1,1,1)*blinn, g.a):
                vec4(r.rgb*lambert+vec3(1,1,1)*blinn, r.a);
}
