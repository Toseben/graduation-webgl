import * as THREE from 'three'
import React, { useMemo, useRef, useEffect } from 'react'
import { useLoader } from "react-three-fiber"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

export default function BackgroundParticles({ useStore }) {
  const background = useRef()
  const setLoaded = useStore(state => state.setLoaded)
  const backgroundGltf = useLoader(GLTFLoader, 'assets/background.glb')

  const modelCenter = useMemo(() => {
    const box = new THREE.Box3();
    backgroundGltf.scene.scale.set(0.225, 0.225, 0.225)
    return box.setFromObject(backgroundGltf.scene).getCenter(new THREE.Vector3()).multiplyScalar(-1)
  }, [])

  useEffect(() => {
    setLoaded(true)
  }, [])

  const circleTex = useLoader(THREE.TextureLoader, 'assets/whiteCircle.png')
  useEffect(() => {
    background.current.traverse(child => {
      if (child instanceof THREE.Points) {
        child.material.size = 1
        child.material.opacity = 0.1
        child.material.map = circleTex
        child.material.alphaMap = circleTex
        child.material.transparent = true
        child.material.depthWrite = false
        child.material.sizeAttenuation = true
        child.renderOrder = 0
      }
    })
  }, [])

  return (
    <primitive ref={background} name="backgroundParticles" object={backgroundGltf.scene} position={modelCenter} />
  )
}