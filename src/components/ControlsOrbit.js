import * as THREE from 'three'
import React, { useRef, useEffect, useMemo } from 'react'
import { extend, useThree, useFrame } from 'react-three-fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { useSpring } from 'react-spring/three'
import * as easings from 'd3-ease'

const dummyMatrix = new THREE.Matrix4();
const dummyVector = new THREE.Vector3();

extend({ OrbitControls })
export default function ControlsOrbit({ useStore }) {
  const hovered = useStore(state => state.hovered)
  const loadAnimDone = useStore(state => state.loadAnimDone)
  const setLoadAnimDone = useStore(state => state.setLoadAnimDone)

  const controls = useRef()
  const { gl, camera, scene } = useThree()

  const avatarGroup = useMemo(() => {
    return scene.getObjectByName('avatarGroup')
  }, [])

  // const orbitTarget = useMemo(() => {
  //   if (!hovered) return null
  //   const avatar = avatarGroup.children[hovered.instance]
  //   avatar.getMatrixAt(hovered.vidId, dummyMatrix)
  //   dummyVector.setFromMatrixPosition(dummyMatrix).normalize().multiplyScalar(0.0001)
  //   return dummyVector
  // }, [hovered])

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
      if (loadAnimDone) return
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
      setLoadAnimDone(true)
      controls.current.enabled = true
      controls.current.target.set(0, height, -0.0001)
      controls.current.minPolarAngle = Math.PI / 2
      controls.current.maxPolarAngle = Math.PI / 2
    }
  }, [])

  const firstTarget = null
  useEffect(() => {
    if (!firstTarget) return
    if (!hovered) return
    const targetArray = controls.current.target.toArray()
    firstTarget.payload.forEach((target, idx) => {
      target.setValue(targetArray[idx])
    })
  }, [hovered])


  // const { firstTarget } = useSpring({
  //   from: {
  //     firstTarget: controls.current ? [controls.current.target.x, height, controls.current.target.z] : [0, height, -0.0001],
  //   },
  //   to: {
  //     firstTarget: orbitTarget ? [orbitTarget.x, height, orbitTarget.z] : [0, height, -0.0001],
  //   },
  //   config: { duration: 2500, easing: easings.easeCubicInOut },
  //   onFrame({ firstTarget }) {
  //     if (!hovered || hovered.setter === 'hover') return
  //     controls.current.target.set(
  //       firstTarget[0],
  //       firstTarget[1],
  //       firstTarget[2]
  //     )
  //   }
  // }, [])

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