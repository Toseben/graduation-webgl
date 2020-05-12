import * as THREE from 'three'
import React, { useMemo, useRef, useEffect } from 'react'
import { useLoader } from "react-three-fiber"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { useSpring } from 'react-spring/three'
import * as easings from 'd3-ease'

export default function Galaxy({ useStore }) {
  const loadAnimDone = useStore(state => state.loadAnimDone)
  const galaxyGltf = useLoader(GLTFLoader, 'assets/galaxy.glb')
  const galaxy = useRef()

  const modelCenter = useMemo(() => {
    const box = new THREE.Box3();
    galaxyGltf.scene.scale.set(5, 5, 5)
    return box.setFromObject(galaxyGltf.scene).getCenter(new THREE.Vector3()).multiplyScalar(-1)
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

  return (
    <primitive ref={galaxy} name="galaxy" object={galaxyGltf.scene} position={modelCenter} />
  )
}