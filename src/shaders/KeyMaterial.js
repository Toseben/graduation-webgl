import * as THREE from 'three';
import KeyVertex from "./Key.vert";
import KeyFragment from "./Key.frag";

export default class CustomMaterial extends THREE.ShaderMaterial {
  constructor(options) {
    const uniforms = Object.assign(THREE.ShaderLib["basic"].uniforms,
      {
        texture0: { value: options.texture0 },
        lum: { value: options.lum },
      }
    );

    super({
      side: THREE.DoubleSide,
      transparent: true,
      vertexShader: KeyVertex,
      fragmentShader: KeyFragment,
      uniforms: uniforms,
      defines: {
        USE_UV: '',
        USE_MAP: '',
      },
      extensions: { derivatives: true }
    })
  }
}