#version 300 es
precision highp float;

in vec3 vNormal;
in vec2 vTexCoord;
//in vec4 vColor;
out vec4 fragColor;

uniform sampler2D image;
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

    fragColor = vec4(texture(image, vTexCoord).rgb*lambert,1.0);

}
