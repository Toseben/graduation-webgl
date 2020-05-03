import * as THREE from 'three'
import React, { Suspense, useRef, useMemo, useState, useCallback, useEffect } from 'react'
import { Canvas, extend, useThree, useFrame } from 'react-three-fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { useLoader } from "react-three-fiber"

// import Avatar from "./Avatar"
import vertexShader from "../shaders/Key.vert";
import fragmentShader from "../shaders/Key.frag";

extend({ OrbitControls })
function ControlsOrbit() {
  const controls = useRef()
  const { camera, gl } = useThree()

  useFrame(() => controls.current.update())
  return (
    <orbitControls ref={controls} args={[camera, gl.domElement]} enableDamping dampingFactor={0.1} rotateSpeed={0.5} />
  )
}

const scratchObject3D = new THREE.Object3D();
const scratchVector3 = new THREE.Vector3();
const cameraVector3 = new THREE.Vector3();
function InstacedAvatar({ avatars, material }) {
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

      for (let i = 0; i < avatars.length; ++i) {
        const { x, z } = avatars[i]
        scratchObject3D.position.set(x, 0, z);
        scratchObject3D.updateMatrix();
        mesh.setMatrixAt(i, scratchObject3D.matrix);
      }

      mesh.instanceMatrix.needsUpdate = true;
    }

    meshRef.current = mesh
  }, [])

  const colorArray = useMemo(() => {
    const color = new Float32Array(avatars.length)
    for (let i = 0; i < avatars.length; ++i) {
      color[i] = 1
    }
    return color
  }, [])

  const [hovered, set] = useState()
  const previous = useRef()
  useEffect(() => void (previous.current = hovered), [hovered])

  useFrame(() => {
    if (!meshRef.current) return

    const cameraPos = cameraVector3.set(camera.position.x, 0, camera.position.z)
    for (let i = 0; i < avatars.length; ++i) {
      colorArray[i] = i === hovered ? Math.max(colorArray[i] - 0.05, 0) : 1
      
      const { x, z } = avatars[i]
      scratchObject3D.position.set(x, 0, z);
      scratchObject3D.lookAt(cameraPos)
      scratchObject3D.updateMatrix();
      meshRef.current.setMatrixAt(i, scratchObject3D.matrix);
    }

    meshRef.current.geometry.attributes.hover.needsUpdate = true
    meshRef.current.instanceMatrix.needsUpdate = true;
  })

  const scale = 0.001
  return (
    <instancedMesh ref={onRefChange} args={[null, null, avatars.length]} frustumCulled={false}
      onPointerMove={e => set(e.instanceId)} onPointerOut={e => set(undefined)}>
      <planeBufferGeometry attach="geometry" args={[280 * scale, 480 * scale]}>
        <instancedBufferAttribute
          attachObject={['attributes', 'hover']}
          args={[colorArray, 1]}
        />
      </planeBufferGeometry>
    </instancedMesh>
  )
}

function Avatars() {
  const radius = 3
  let avatarArray = new Array(100).fill(null)
  avatarArray = avatarArray.map((avatar, idx) => {
    const x = Math.sin(idx / avatarArray.length * Math.PI * 2) * radius
    const z = Math.cos(idx / avatarArray.length * Math.PI * 2) * radius
    return { x, z }
  })

  const videoArray = useMemo(() => {
    let videoArray = new Array(5).fill(null)
    return videoArray.map((node, idx) => {
      const video = document.createElement('video');
      video.src = `assets/avatar.webm`;
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

      const uniforms = Object.assign(THREE.ShaderLib["basic"].uniforms, {
        map: { value: texture },
        lum: { value: new THREE.Vector2(0.0, 0.1) },
      });

      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
        transparent: true,
        side: THREE.DoubleSide
      }).clone()

      return { video, texture, material }
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
      {videoArray.map((video, idx) => {
        return <InstacedAvatar key={idx} avatars={avatarArray.filter((avatar, i) => i % videoArray.length === idx)} material={video.material} />
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