#version 300 es
precision highp float;

in vec3 vNormal;
in vec4 vColor;
out vec4 fragColor;

uniform mat4 m;
uniform vec3 lightdir;
uniform vec3 halfway;
uniform vec3 fog;
uniform float v;

void main() {
    /*
    float lambert = max(dot(vNormal, lightdir),0.5);
    fragColor = vec4(vColor.rgb*lambert, vColor.a);*/

    
    vec3 n = normalize(vNormal);
    float lambert = max(dot(n, lightdir),0.0);
    //float lambert = dot(n, lightdir);
    
    float blinn = pow(max(dot(n, mat3(m)*halfway*0.667),0.0), 160.0);
    
    float visibility = pow(exp(1.0),v*(1.0/gl_FragCoord.w));
    fragColor = vec4(vColor.rgb*lambert
                    +vec3(1,1,1)*blinn, 
                    vColor.a);
    //fragColor = vec4(fragColor.rgb+fog.rgb*visibility, fragColor.a);
    fragColor = vec4(fragColor.rgb*(1.0-visibility)+fog.rgb*visibility, fragColor.a);
}
