import * as THREE from 'three'
import React, { useRef, useEffect } from 'react'
import { useThree } from 'react-three-fiber';
import { useLoader } from "react-three-fiber"
import { Reflector } from '../lib/Reflector.js';

export default function GroundReflector({ useStore }) {
  const reflectorRef = useRef()
  const setReflector = useStore(state => state.setReflector)

  const { scene } = useThree()
  const [cementTexture] = useLoader(THREE.TextureLoader, ['assets/cement.jpg'])
  cementTexture.wrapS = cementTexture.wrapT = THREE.RepeatWrapping;

  useEffect(() => {
    const geometry = new THREE.CircleBufferGeometry(6.5, 64);
    const groundMirror = new Reflector(geometry, {
      clipBias: 0.003,
      textureWidth: 128,
      textureHeight: 128,
      color: 0x777777,
      map: cementTexture
    });

    groundMirror.rotateX(-Math.PI / 2);
    scene.add(groundMirror);

    setReflector(groundMirror)
    reflectorRef.current = groundMirror
  })

  return (
    <></>
  )
}