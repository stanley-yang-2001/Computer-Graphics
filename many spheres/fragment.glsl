#version 300 es
precision highp float;

in vec3 vNormal;
in vec4 vColor;
out vec4 fragColor;

//uniform vec4 color;
uniform mat4 m;
uniform vec3 lightdir;
uniform vec3 halfway;

void main() {
    /*
    float lambert = max(dot(vNormal, lightdir),0.5);
    fragColor = vec4(vColor.rgb*lambert, vColor.a);*/

    /*
    vec3 n = normalize(vNormal);
    float lambert = max(dot(n, lightdir),0.0);
    //float lambert = dot(n, lightdir);
    float blinn = pow(max(dot(n, mat3(m)*halfway*0.667),0.0), 160.0);
    fragColor = vec4(color.rgb*lambert
                    +vec3(1,1,1)*blinn, 
                    color.a);*/

    //fragColor = color;
    //fragColor = vec4(vNormal,1.0);
    //vColor = vec4(1.0, 0.0, 0.0, 1.0);
    
    //vec4 color = vec4(1.0, 0.0, 0.0, 1.0);
    vec2 screenxy = -1.0 + gl_PointCoord*2.0;
    float magn = length(screenxy);

    
    if (magn > 1.0){
        discard;
    }else{
        float nz = sqrt(1.0-pow(magn,2.0));
        vec3 n = normalize(normalize(vec3(screenxy, nz)));
        //vec3 n = normalize(vec3(screenxy, nz));
        
        float lambert = max(dot(n, lightdir),0.0);
        float blinn = pow(max(dot(n, mat3(m)*halfway),0.0), 160.0);
        fragColor = vec4(vColor.rgb*lambert
                    +vec3(1,1,1)*blinn, 
                    vColor.a);


    }
    
    //fragColor = vec4(1.0, 0.0, 0.0, 1.0);


}

