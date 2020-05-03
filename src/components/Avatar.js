import * as THREE from 'three'
import React, { useMemo, useEffect, useRef, useState, useCallback } from 'react'
import { useFrame, useThree } from 'react-three-fiber';
import { useSpring, a } from 'react-spring/three'
import * as easings from 'd3-ease'

import vertexShader from "../shaders/Key.vert";
import fragmentShader from "../shaders/Key.frag";

export default function Avatar({ texture, material, pos }) {
  const meshRef = useRef();
  const { camera } = useThree()

  const onRefChange = useCallback(mesh => {
    if (meshRef.current) {
      // Make sure to cleanup any events/references added to the last instance
    }

    if (mesh) {
      // Check if a node is actually passed. Otherwise node would be null.
      // You can now do what you need to, addEventListeners, measure, etc.
      mesh.material = material
    }

    meshRef.current = mesh
  }, [])

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
        ref={onRefChange}
        position={pos}
        onPointerOver={hover} onPointerOut={unhover}>
        <planeBufferGeometry attach="geometry" args={[280 * scale, 480 * scale]} />
        {/* <shaderMaterial
          attach="material"
          args={[{
            uniforms: Object.assign(THREE.ShaderLib["basic"].uniforms, {
              map: { value: texture }
            }),
            vertexShader: vertShader,
            fragmentShader: fragShader,
          }]}
        /> */}
        {/* <a.meshLambertMaterial attach="material" side={THREE.DoubleSide} map={texture} color={spring.color} /> */}
      </mesh>
    </>
  )
}