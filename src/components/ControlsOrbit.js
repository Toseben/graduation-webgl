import * as THREE from 'three'
import React, { useRef, useEffect, useMemo } from 'react'
import { extend, useThree, useFrame } from 'react-three-fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { useSpring } from 'react-spring/three'
import * as easings from 'd3-ease'

const dummyMatrix = new THREE.Matrix4();
const dummyVector = new THREE.Vector3();

const smoothstep = (lowerBound, upperBound, value) => {
  var clippedValue = value > upperBound ? upperBound : value < lowerBound ? lowerBound : value;
  var normalizedValue = (clippedValue - lowerBound) / (upperBound - lowerBound);
  return normalizedValue * normalizedValue * (3 - 2 * normalizedValue);
}

extend({ OrbitControls })
export default function ControlsOrbit({ useStore }) {
  const hovered = useStore(state => state.hovered)
  const loadAnimDone = useStore(state => state.loadAnimDone)
  const setLoadAnimDone = useStore(state => state.setLoadAnimDone)
  const reflector = useStore(state => state.reflector)
  const setControls = useStore(state => state.setControls)

  const controls = useRef()
  const { gl, camera, scene } = useThree()

  const avatarGroup = useMemo(() => {
    return scene.getObjectByName('avatarGroup')
  }, [])

  const orbitTarget = useMemo(() => {
    if (!hovered) return null
    const avatar = avatarGroup.children[hovered.vidId]
    avatar.getMatrixAt(hovered.instance, dummyMatrix)
    dummyVector.setFromMatrixPosition(dummyMatrix).normalize().multiplyScalar(0.0001)
    return dummyVector
  }, [hovered])

  const height = 1.246
  useSpring({
    from: {
      camPos: [0, 10 * 250, 15 * 250],
      camTarget: [0, height, 0],
      size: 1,
    },
    to: {
      camPos: [0, height, 10],
      camTarget: [0, 0, 0],
      size: 0,
    },
    config: { duration: 750, easing: easings.easeSinOut },
    delay: 1000,
    onFrame({ camPos, camTarget, size }) {
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

      const galaxy = scene.getObjectByName('galaxy')
      if (!galaxy) return
      galaxy.traverse(child => {
        if (child instanceof THREE.Points) {
          child.material.size = Math.pow(size, 0.75) * 30
        }
      })

      const backgroundParticles = scene.getObjectByName('backgroundParticles')
      if (!backgroundParticles) return
      backgroundParticles.traverse(child => {
        if (child instanceof THREE.Points) {
          child.material.opacity = (1 - smoothstep(0.0, 0.1, size)) * 0.1
        }
      })
    },
    onRest() {
      if (loadAnimDone) return
      setLoadAnimDone(true)
      const galaxy = scene.getObjectByName('galaxy')
      galaxy.traverse(child => {
        if (child instanceof THREE.Points) {
          child.visible = false
        }
      })

      if (!controls.current) return
      controls.current.enabled = true
      controls.current.maxPolarAngle = Math.PI / 2 - 0.125
      controls.current.minPolarAngle = 1
      controls.current.maxDistance = 10
    }
  }, [])

  useEffect(() => {
    if (!firstTarget) return
    if (!hovered) return
    const targetArray = controls.current.target.toArray()
    firstTarget.payload.forEach((target, idx) => {
      target.setValue(targetArray[idx])
    })
  }, [hovered])

  const { firstTarget } = useSpring({
    from: {
      firstTarget: controls.current ? [controls.current.target.x, height, controls.current.target.z] : [0, height, -0.0001],
    },
    to: {
      firstTarget: orbitTarget ? [orbitTarget.x, height, orbitTarget.z] : [0, height, -0.0001],
    },
    config: { duration: 2500, easing: easings.easeCubicInOut },
    onFrame({ firstTarget }) {
      if (!hovered || hovered.setter === 'hover') return
      controls.current.target.set(
        firstTarget[0],
        firstTarget[1],
        firstTarget[2]
      )
    }
  }, [])

  useEffect(() => {
    controls.current.isRotating = false
    setControls(controls.current)
    window.controls = controls.current

    controls.current.enabled = false
    controls.current.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: null,
      RIGHT: null
    }
  }, [])

  const prevRotation = useRef()
  useFrame(() => {
    controls.current.update()
    controls.current.isRotating = Math.abs(prevRotation.current - camera.rotation.y) > 0.0005
    prevRotation.current = camera.rotation.y

    const background = scene.getObjectByName('background')
    camera.rotation.reorder('YXZ')
    if (background) {
      background.rotation.reorder('YXZ')
      background.rotation.y = camera.rotation.y
    }
    
    if (reflector) {
      reflector.renderReflector(gl, scene, camera)
    }
  })

  return (
    <orbitControls ref={controls} args={[camera, gl.domElement]} enableDamping dampingFactor={0.1} rotateSpeed={0.5} />
  )
}