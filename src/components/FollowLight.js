import * as THREE from 'three'
import React, { useRef, useEffect } from 'react'
import { useLoader } from "react-three-fiber"
import { useSpring, a } from 'react-spring/three'

export default function FollowLight({ useStore }) {
  const setProgress = useStore(state => state.setProgress)

  const group = useRef()
  const calc = (x, y) => [(x - window.innerWidth / 2), (y - window.innerHeight / 2) * -1]
  const [props, set] = useSpring(() => ({ xy: [0, 0], config: { mass: 10, tension: 550, friction: 140 } }))

  const onMouseMove = e => {
    set({ xy: calc(e.pageX, e.pageY) })
  }

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  const cursorTex = useLoader(THREE.TextureLoader, 'assets/lensflare.png', loader => {
    loader.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      setProgress(parseInt(itemsLoaded / itemsTotal * 100));
    };
  })

  return (
    <group ref={group} name="background">
      <a.mesh position={props.xy.interpolate((x, y) => [x * 0.0035, y * 0.0015 + 1, -4])}>
        <planeBufferGeometry attach="geometry" args={[0.75, 0.75]} />
        <meshBasicMaterial attach="material" map={cursorTex} transparent depthTest={false} blending={THREE.AdditiveBlending} />
      </a.mesh>
      <a.mesh position={props.xy.interpolate((x, y) => [x * 0.0035, y * 0.0015 + 1, -4])}>
        <sphereBufferGeometry attach="geometry" args={[0.02, 16, 16]} />
        <meshBasicMaterial attach="material"/>
      </a.mesh>
    </group>
  )
}