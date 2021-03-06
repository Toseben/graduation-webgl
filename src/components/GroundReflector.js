import * as THREE from 'three'
import React, { useRef, useEffect } from 'react'
import { useThree } from 'react-three-fiber';
import { useLoader } from "react-three-fiber"
import { Reflector } from '../lib/Reflector.js';

export default function GroundReflector({ useStore }) {
  const reflectorRef = useRef()
  const setReflector = useStore(state => state.setReflector)
  const setProgress = useStore(state => state.setProgress)

  const { scene } = useThree()
  const [cementTexture] = useLoader(THREE.TextureLoader, ['assets/cement.jpg'], loader => {
    loader.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      setProgress(parseInt(itemsLoaded / itemsTotal * 100));
    };
  })

  cementTexture.wrapS = cementTexture.wrapT = THREE.RepeatWrapping;

  useEffect(() => {
    const geometry = new THREE.CircleBufferGeometry(10, 64);
    const groundMirror = new Reflector(geometry, {
      clipBias: 0.003,
      textureWidth: 256,
      textureHeight: 256,
      color: 0xffffff,
      map: cementTexture
    });

    groundMirror.renderOrder = 1
    groundMirror.rotateX(-Math.PI / 2);
    scene.add(groundMirror);

    setReflector(groundMirror)
    reflectorRef.current = groundMirror
  }, [])

  return (
    <></>
  )
}