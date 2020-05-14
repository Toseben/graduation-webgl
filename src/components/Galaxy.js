import * as THREE from 'three'
import React, { useMemo, useRef, useEffect } from 'react'
import { useLoader, useFrame } from "react-three-fiber"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

export default function Galaxy({ useStore }) {
  const loadAnimDone = useStore(state => state.loadAnimDone)
  const setProgress = useStore(state => state.setProgress)

  const galaxy = useRef()
  const spin = useRef()

  const galaxyGltf = useLoader(GLTFLoader, 'assets/galaxy.glb', loader => {
    loader.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      setProgress(parseInt(itemsLoaded / itemsTotal * 100));
    };
  })

  const starTexture = useLoader(THREE.TextureLoader, 'assets/lensflare.png', loader => {
    loader.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      setProgress(parseInt(itemsLoaded / itemsTotal * 100));
    };
  })

  const modelCenter = useMemo(() => {
    const box = new THREE.Box3();
    galaxyGltf.scene.scale.set(5, 5, 5)
    const modelCenter = box.setFromObject(galaxyGltf.scene).getCenter(new THREE.Vector3()).multiplyScalar(-1)
    modelCenter.add(new THREE.Vector3(0, -25, 0))
    return modelCenter
  }, [])

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
    spin.current.rotation.y += loadAnimDone ? 0.00025 : 0.0025
  })

  return (
    <group ref={spin}>
      <primitive ref={galaxy} name="galaxy" object={galaxyGltf.scene} position={modelCenter} />
    </group>
  )
}