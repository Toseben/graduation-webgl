import * as THREE from 'three'
import React, { Suspense, useRef } from 'react'
import { Canvas, extend, useThree, useFrame } from 'react-three-fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { useLoader } from "react-three-fiber"

import Avatar from "./Avatar"

extend({ OrbitControls })
function ControlsOrbit() {
  const controls = useRef()
  const { camera, gl } = useThree()

  useFrame(() => controls.current.update())
  return (
    <orbitControls ref={controls} args={[camera, gl.domElement]} enableDamping dampingFactor={0.1} rotateSpeed={0.5} />
  )
}

const Graphics = ({ }) => {
  return (
    <Canvas
      gl={{ antialias: true }}
      onCreated={({ gl }) => {
        gl.setClearColor(0xBDCAC0)
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.outputEncoding = THREE.sRGBEncoding
      }}
      camera={{
        far: 100, near: 0.01, fov: 60,
        position: new THREE.Vector3(5, 2.5, 5)
      }}>

      <ControlsOrbit />
      <Suspense fallback={null}>
        <Avatar />
      </Suspense>
    </Canvas>
  );
};

export default Graphics;