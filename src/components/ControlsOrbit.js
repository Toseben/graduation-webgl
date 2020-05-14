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
  const setHovered = useStore(state => state.setHovered)

  const controls = useRef()
  const { gl, camera, scene } = useThree()

  const avatarGroup = useMemo(() => {
    return scene.getObjectByName('avatarGroup')
  }, [])

  const orbitTarget = useMemo(() => {
    if (!hovered) return null
    const center = parseInt(hovered.array.length / 2)
    const avatar = avatarGroup.children[hovered.array[center].vidId]
    avatar.getMatrixAt(hovered.array[center].instance, dummyMatrix)
    dummyVector.setFromMatrixPosition(dummyMatrix).normalize().multiply(new THREE.Vector3(-0.25, 1, -0.25))
    return dummyVector
  }, [hovered])

  const height = 0.75
  useSpring({
    from: {
      camPos: [0, 10 * 250, -15 * 250],
      camTarget: [0, height, 0],
      size: 1,
    },
    to: {
      camPos: [0, height, -10],
      camTarget: [0, height * 0.5, 0],
      size: 0,
    },
    config: { duration: 7500 * 0.1, easing: easings.easeSinOut },
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
          child.material.size = Math.pow(size, 0.75) * 30 + 0.5
        }
      })

      const backgroundParticles = scene.getObjectByName('backgroundParticles')
      if (!backgroundParticles) return
      backgroundParticles.traverse(child => {
        if (child instanceof THREE.Points) {
          child.material.uniforms.scale.value = 1.0 - smoothstep(0.0, 0.1, size)
        }
      })
    },
    onRest() {
      if (loadAnimDone) return
      setLoadAnimDone(true)
      // setTimeout(() => {
        setHovered({ array: [{ instance: 0, vidId: 0 }], setter: 'search' })
      // }, 1000)

      if (!controls.current) return
      controls.current.enabled = true
      controls.current.maxPolarAngle = Math.PI / 2 - 0.025
      controls.current.minPolarAngle = 1.25
      controls.current.maxDistance = 10
    }
  }, [])

  useEffect(() => {
    if (!firstTarget) return
    if (!hovered) return
    const targetArray = camera.position.toArray()
    firstTarget.payload.forEach((target, idx) => {
      target.setValue(targetArray[idx])
    })
  }, [hovered])

  const { firstTarget } = useSpring({
    from: {
      firstTarget: [camera.position.x, camera.position.y, camera.position.z],
    },
    to: {
      firstTarget: orbitTarget ? [orbitTarget.x, height * 0.5, orbitTarget.z] : [camera.position.x, camera.position.y, camera.position.z],
    },
    config: { duration: 2500, easing: easings.easeSineInOut },
    onFrame({ firstTarget }) {
      if (!hovered || hovered.setter === 'hover') return
      camera.position.set(
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
      MIDDLE: THREE.MOUSE.DOLLY,
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

    const backgroundParticles = scene.getObjectByName('backgroundParticles')
    if (reflector) {
      reflector.renderReflector(gl, scene, camera, backgroundParticles)
    }
  })

  return (
    <orbitControls ref={controls} args={[camera, gl.domElement]} enableDamping dampingFactor={0.1} rotateSpeed={-0.5} />
  )
}