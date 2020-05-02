import * as THREE from 'three'
import React, { Suspense, useRef, useMemo, useEffect } from 'react'
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

function Avatars() {
  const avatarArray = new Array(50).fill(null)
  const radius = 3

  const videoArray = useMemo(() => {
    let videoArray = new Array(5).fill(null)
    return videoArray.map((node, idx) => {
      const video = document.createElement('video');
      video.src = `assets/avatar.mp4`;
      video.loop = true
      video.muted = true
      video.id = `video-${idx}`
      video.load();

      // document.body.append(video)
      video.currentTime = idx / videoArray.length * 1.8
      video.play()

      const texture = new THREE.VideoTexture(video);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.format = THREE.RGBFormat;
      texture.encoding = THREE.sRGBEncoding;

      return { video, texture }
    })
  }, [])

  // useEffect(() => {
  //   return () => {
  //     videoArray.forEach(vid => {
  //       if (vid['video'].parentNode) document.body.removeChild(vid['video'])
  //     })
  //   }
  // }, [])

  return (
    <group>
      {avatarArray.map((node, idx) => {
        const x = Math.sin(idx / avatarArray.length * Math.PI * 2) * radius
        const z = Math.cos(idx / avatarArray.length * Math.PI * 2) * radius
        return <Avatar key={idx} texture={videoArray[idx % videoArray.length].texture} pos={new THREE.Vector3(x, 0, z)} />
      })}
    </group>
  )
}

const Graphics = ({ }) => {
  return (
    <Canvas
      gl={{ antialias: true }}
      onCreated={({ gl }) => {
        // gl.setClearColor(0xBDCAC0)
        // gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.outputEncoding = THREE.sRGBEncoding
      }}
      camera={{
        far: 100, near: 0.01, fov: 60,
        position: new THREE.Vector3(5, 2.5, 5)
      }}>

      <ambientLight />
      <ControlsOrbit />
      <Suspense fallback={null}>
        <Avatars />
      </Suspense>
    </Canvas>
  );
};

export default Graphics;