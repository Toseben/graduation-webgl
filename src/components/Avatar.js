import * as THREE from 'three'
import React, { useMemo, useEffect, useRef } from 'react'
import { useFrame, useThree } from 'react-three-fiber';
import { useSpring, a } from 'react-spring/three'
import * as easings from 'd3-ease'
import KeyMaterial from "../shaders/KeyMaterial"

export default function Avatar({ texture, pos }) {
  const meshRef = useRef();
  const { camera } = useThree()

  const keyMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      map: texture
    })
    // return new KeyMaterial({
    //   texture0: avatarTex,
    //   lum: new THREE.Vector2(1, 1)
    // })
  }, [])

  useEffect(() => {
    if (meshRef.current) meshRef.current.material = keyMaterial
  }, [meshRef.current])

  useFrame(() => {
    if (!meshRef.current) return
    meshRef.current.lookAt(camera.position.clone().setComponent(1, 0))
  })

  const spring = useSpring({
    opacity: true ? 1 : 0,
    config: { duration: 500, easing: easings.easeCubicInOut }
  })

  const scale = 0.001
  return (
    <>
      <mesh
        ref={meshRef}
        position={pos}>
        <planeGeometry attach="geometry" args={[280 * scale, 480 * scale]} />
        <meshLambertMaterial attach="material" side={THREE.DoubleSide} />
      </mesh>
    </>
  )
}