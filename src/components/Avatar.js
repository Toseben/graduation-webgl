import * as THREE from 'three'
import React, { useMemo, useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from 'react-three-fiber';
import { useSpring, a } from 'react-spring/three'
import * as easings from 'd3-ease'
import KeyMaterial from "../shaders/KeyMaterial"

export default function Avatar({ texture, pos }) {
  const meshRef = useRef();
  const { camera } = useThree()

  // const keyMaterial = useMemo(() => {
  //   return new KeyMaterial({
  //     texture0: avatarTex,
  //     lum: new THREE.Vector2(1, 1)
  //   })
  // }, [])

  // useEffect(() => {
  //   if (meshRef.current) meshRef.current.material = keyMaterial
  // }, [meshRef.current])

  useFrame(() => {
    if (!meshRef.current) return
    meshRef.current.lookAt(camera.position.clone().setComponent(1, 0))
  })

  const [hovered, set] = useState(false)
  const hover = e => e.stopPropagation() && set(true)
  const unhover = () => set(false)

  const spring = useSpring({
    color: hovered ? '#ffffff' : '#171717'
  })

  const scale = 0.001
  return (
    <>
      <mesh
        ref={meshRef}
        position={pos}
        onPointerOver={hover} onPointerOut={unhover}>
        <planeGeometry attach="geometry" args={[280 * scale, 480 * scale]} />
        <a.meshLambertMaterial attach="material" side={THREE.DoubleSide} map={texture} color={spring.color} />
      </mesh>
    </>
  )
}