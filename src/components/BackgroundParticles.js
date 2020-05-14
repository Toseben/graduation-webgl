import * as THREE from 'three'
import React, { useMemo, useRef } from 'react'
import { useLoader } from "react-three-fiber"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import tinygradient from 'tinygradient'
const hoursColors = tinygradient(['#18453B', '#0DB14B', '#94AE4A', '#D1DE3F', '#008183', '#63005F'])
const gradient = hoursColors.rgb(10)

const vertexShader = `
attribute float size;
varying vec3 vColor;
void main() {
  vColor = color;
  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
  gl_PointSize = size * ( 300.0 / -mvPosition.z ) * 0.5;
  gl_Position = projectionMatrix * mvPosition;
}
`

const fragmentShader = `
uniform sampler2D pointTexture;
uniform float scale;
varying vec3 vColor;
void main() {
  gl_FragColor = vec4( vColor * scale, 0.75 );
  gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );
  if ( gl_FragColor.a < 0.25 ) discard;
}
`

export default function BackgroundParticles({ useStore }) {
  const background = useRef()
  const setLoaded = useStore(state => state.setLoaded)
  const setProgress = useStore(state => state.setProgress)

  const backgroundGltf = useLoader(GLTFLoader, 'assets/background_v001.glb', loader => {
    loader.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      setProgress(parseInt(itemsLoaded / itemsTotal * 100));
    };

    loader.manager.onLoad = function () {
      setTimeout(() => {
        setLoaded(true)
      }, 500)
    };
  })

  const circleTex = useLoader(THREE.TextureLoader, 'assets/whiteCircle.png', loader => {
    loader.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      setProgress(parseInt(itemsLoaded / itemsTotal * 100));
    };

    loader.manager.onLoad = function () {
      setTimeout(() => {
        setLoaded(true)
      }, 500)
    };
  })

  const points = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const colorAttribute = backgroundGltf.__$[1].geometry.attributes.color.clone()
    const colorArray = colorAttribute.array
    const sizes = new Float32Array(colorArray.length / 3);

    for (let i = 0; i < colorArray.length; i = i + 3) {
      const sample = colorArray[i]
      const color = gradient[parseInt(sample * gradient.length)]
      colorArray[i] = color['_r'] / 255
      colorArray[i + 1] = color['_g'] / 255
      colorArray[i + 2] = color['_b'] / 255
      sizes[i / 3] = 1.0 - parseFloat(sample) + THREE.MathUtils.randFloat(-0.25, 0.25)
    }

    geometry.setAttribute('position', backgroundGltf.__$[1].geometry.attributes.position);
    geometry.setAttribute('color', colorAttribute);
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    let material = new THREE.PointsMaterial({
      size: 20.0,
      vertexColors: true,
      opacity: 0.75,
      map: circleTex,
      transparent: true,
      sizeAttenuation: false,
      alphaTest: 0.25,
      // blending: THREE.AdditiveBlending,
      color: new THREE.Color("hsl(0, 0%, 100%)")
    });

    material = new THREE.ShaderMaterial({
      uniforms: {
        pointTexture: { value: circleTex },
        scale: { value: 1.0 }
      },
      vertexShader,
      fragmentShader,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    return points
  }, [])

  return (
    <primitive ref={background} name="backgroundParticles" object={points} scale={[0.15, 0.15, 0.15]} />
  )
}