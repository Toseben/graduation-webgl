import * as THREE from 'three'
import React, { useRef, useEffect } from 'react'
import { extend, useThree, useFrame } from 'react-three-fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { useSpring } from 'react-spring/three'
import * as easings from 'd3-ease'

extend({ OrbitControls })
export default function ControlsOrbit({useStore}) {
  const controls = useRef()
  const loadAnimFinish = useRef(false)
  const { gl, scene, camera } = useThree()
  const reflector = useStore(state => state.reflector)

  const height = 0.5
  useSpring({
    from: {
      camPos: [0, 10, 15],
      camTarget: [0, height, 0],
    },
    to: {
      camPos: [0, height, 0],
      camTarget: [0, height, -10],
    },
    config: { duration: 2000, easing: easings.easeSinOut },
    delay: 1000,
    onFrame({ camPos, camTarget }) {
      if (loadAnimFinish.current) return
      camera.position.set(
        camPos[0],
        camPos[1],
        camPos[2]
      )

      controls.current.target.set(
        camTarget[0],
        camTarget[1],
        camTarget[2]
      )
    },
    onRest() {
      loadAnimFinish.current = true
      controls.current.enabled = true
      controls.current.target.set(0, height, -0.001)
      controls.current.minPolarAngle = Math.PI / 2
      controls.current.maxPolarAngle = Math.PI / 2
    }
  }, [])

  useEffect(() => {
    controls.current.enabled = false
    controls.current.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: null,
      RIGHT: null
    }
  }, [])

  useFrame(() => {
    controls.current.update()
  })
  return (
    <orbitControls ref={controls} args={[camera, gl.domElement]} enableDamping dampingFactor={0.1} rotateSpeed={-0.5} />
  )
}