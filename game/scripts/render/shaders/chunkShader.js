export default {
  vert: `
const float PI = 3.1415926535897932384626433832795;
attribute vec4 size;
attribute vec3 a_uv;

precision mediump float;
varying vec3 faceUV;
varying vec4 faceUVSize;
uniform float sun;

void main(){
    faceUV.xy = a_uv.xy;
    faceUV.z = 0.5;
    if(a_uv.z > 0.){
      float diff = abs(mod(a_uv.z * (PI * 0.5), (2.0 * PI)) - mod(sun, (2.0 * PI)));
      if (diff > PI) {
        diff = 2.0 * PI - diff;
      }
      faceUV.z = diff/PI;
      if (faceUV.z >= .8){
        faceUV.z = .8;
      }
    }
    faceUVSize = size;
    
     
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
}`,
  frag: `
const float PI = 3.1415926535897932384626433832795;
precision mediump float;
uniform vec2 atlasFract;
uniform sampler2D atlas;
uniform vec3 fogColor;
uniform float fogNear;
uniform float fogFar;
uniform float sun;

varying vec3 faceUV;
varying vec4 faceUVSize;

void main(){
  vec4 color = texture2D(atlas, fract(faceUV.xy * faceUVSize.xy) * atlasFract + atlasFract * faceUVSize.zw);
  float moonLight = PI * 2. - (sun + PI);
  if (moonLight < PI) {
    moonLight = 1.;
  }
  moonLight *= 0.5;
  vec3 lightColor = vec3(.9, .9, .9);
  gl_FragColor = color * (vec4( moonLight , moonLight, moonLight, 1) - vec4( moonLight , moonLight, moonLight, 0) * faceUV.z);
  #ifdef USE_FOG
    #ifdef USE_LOGDEPTHBUF_EXT
      float depth = gl_FragDepthEXT / gl_FragCoord.w;
    #else
      float depth = gl_FragCoord.z / gl_FragCoord.w;
    #endif
    float fogFactor = smoothstep( fogNear, fogFar, depth );
    gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
  #endif
}

`,
};
