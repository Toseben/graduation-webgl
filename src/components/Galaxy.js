import * as THREE from 'three'
import React, { useMemo, useRef, useEffect } from 'react'
import { useLoader, useFrame } from "react-three-fiber"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

export default function Galaxy({ useStore }) {
  const galaxyGltf = useLoader(GLTFLoader, 'assets/galaxy.glb')
  const galaxy = useRef()
  const spin = useRef()

  const modelCenter = useMemo(() => {
    const box = new THREE.Box3();
    galaxyGltf.scene.scale.set(5, 5, 5)
    const modelCenter = box.setFromObject(galaxyGltf.scene).getCenter(new THREE.Vector3()).multiplyScalar(-1)
    modelCenter.add(new THREE.Vector3(0, -25, 0))
    return modelCenter
  }, [])

  const starTexture = useLoader(THREE.TextureLoader, 'assets/lensflare.png')
  useEffect(() => {
    galaxy.current.traverse(child => {
      if (child instanceof THREE.Points) {
        child.material.size = 30
        child.material.map = starTexture
        child.material.alphaMap = starTexture
        child.material.transparent = true
        child.material.blending = THREE.AdditiveBlending
        child.material.depthWrite = false
        child.material.sizeAttenuation = true
      }
    })
  }, [])

  useFrame(() => {
    if (!spin.current) return
    spin.current.rotation.y += 0.0025
  })

  return (
    <group ref={spin}>
      <primitive ref={galaxy} name="galaxy" object={galaxyGltf.scene} position={modelCenter} />
    </group>
  )
}