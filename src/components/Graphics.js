import * as THREE from 'three'
import React, { Suspense, useRef, useMemo, useState, useCallback, useEffect } from 'react'
import { Canvas, useThree, useFrame } from 'react-three-fiber';
import { useLoader } from "react-three-fiber"
import { Reflector } from '../lib/Reflector.js';

import ControlsOrbit from "./ControlsOrbit"
import vertexShader from "../shaders/Key.vert";
import fragmentShader from "../shaders/Key.frag";

const scratchObject3D = new THREE.Object3D();
const scratchVector3 = new THREE.Vector3();
const cameraVector3 = new THREE.Vector3();
function InstacedAvatar({ useStore, id, avatars, material }) {
  const hovered = useStore(state => state.hovered)
  const setHovered = useStore(state => state.setHovered)

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

  const previous = useRef()
  // useEffect(() => void (previous.current = hovered.instance), [hovered])

  useFrame(() => {
    if (!meshRef.current) return

    const cameraPos = cameraVector3.set(camera.position.x, 0, camera.position.z)
    for (let i = 0; i < avatars.length; ++i) {
      colorArray[i] = (hovered && i === hovered.instance && id === hovered.id) ? Math.max(colorArray[i] - 0.1, 0) : Math.min(colorArray[i] + 0.1, 1)

      const { x, z } = avatars[i]
      scratchObject3D.position.set(x, 0, z);
      scratchObject3D.lookAt(cameraPos)
      scratchObject3D.updateMatrix();
      meshRef.current.setMatrixAt(i, scratchObject3D.matrix);
    }

    meshRef.current.geometry.attributes.hover.needsUpdate = true
    meshRef.current.instanceMatrix.needsUpdate = true;
  })

  const onPointerMove = (e) => {
    if (hovered) {
      if (e.instanceId === hovered.instance && id === hovered.id) return
    }
    setHovered({ instance: e.instanceId, id: id })
  }

  const scale = 0.001
  return (
    <instancedMesh ref={onRefChange} args={[null, null, avatars.length]} frustumCulled={false}
      onPointerOver={e => onPointerMove(e)} onPointerOut={e => setHovered(undefined)} position={[0, 444 * scale * 0.5, 0]}>
      <planeBufferGeometry attach="geometry" args={[204 * scale, 444 * scale]}>
        <instancedBufferAttribute
          attachObject={['attributes', 'hover']}
          args={[colorArray, 1]}
        />
      </planeBufferGeometry>
    </instancedMesh>
  )
}

function Avatars({ useStore }) {
  const radius = 3.75
  let avatarArray = new Array(window.studentData.length).fill(null)
  avatarArray = avatarArray.map((avatar, idx) => {
    const x = Math.sin(idx / avatarArray.length * Math.PI * 2) * radius
    const z = Math.cos(idx / avatarArray.length * Math.PI * 2) * radius
    return { x, z }
  })

  const videoArray = useMemo(() => {
    let videoArray = new Array(5).fill(null)
    return videoArray.map((node, idx) => {
      const video = document.createElement('video');
      video.src = `assets/avatar_crop.webm`;
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
        return <InstacedAvatar key={idx} useStore={useStore} id={idx} avatars={avatarArray.filter((avatar, i) => i % videoArray.length === idx)} material={video.material} />
      })}
    </group>
  )
}

function Background({ useStore }) {
  const group = useRef()
  const reflectorRef = useRef()
  const setReflector = useStore(state => state.setReflector)

  const { gl, scene, camera } = useThree()
  // const [particleTex] = useLoader(THREE.TextureLoader, ['./assets/particles.jpg'])
  // particleTex.encoding = THREE.sRGBEncoding;
  const scale = 0.0065

  const particleTex = useMemo(() => {
    const video = document.createElement('video');
    video.src = `assets/smallParticles.mp4`;
    video.loop = true
    video.muted = true
    video.id = `video-particles`
    video.load();
    video.play();

    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBFormat;
    texture.encoding = THREE.sRGBEncoding;
    return texture
  }, [])
  
  useFrame(() => {
    if (!group.current || !reflectorRef.current) return
    reflectorRef.current.renderReflector(gl, scene, camera)

    camera.rotation.reorder('YXZ')
    group.current.rotation.reorder('YXZ')
    group.current.rotation.y = camera.rotation.y
  })

  useEffect(() => {
    const geometry = new THREE.CircleBufferGeometry(5.5, 64);
    const groundMirror = new Reflector(geometry, {
      clipBias: 0.003,
      textureWidth: 256,
      textureHeight: 256,
      color: 0x777777
    });

    groundMirror.rotateX(-Math.PI / 2);
    group.current.add(groundMirror);

    setReflector(groundMirror)
    reflectorRef.current = groundMirror
  })

  return (
    <group ref={group}>
      <mesh position={[0, 354 * scale * 0.5, -5]}>
        <planeGeometry attach="geometry" args={[720 * scale, 354 * scale]} />
        <meshStandardMaterial attach="material" map={particleTex} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

const Graphics = ({ useStore }) => {
  return (
    <Canvas
      gl={{ antialias: true }}
      onCreated={({ gl }) => {
        // gl.setClearColor(0xBDCAC0)
        // gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.outputEncoding = THREE.sRGBEncoding
      }}
      camera={{
        far: 100, near: 0.01, fov: 40,
        // position: new THREE.Vector3(0, 1, 10)
      }}>

      <ambientLight />
      <ControlsOrbit useStore={useStore} />
      <Suspense fallback={null}>
        <Background useStore={useStore} />
        <Avatars useStore={useStore} />
      </Suspense>
    </Canvas>
  );
};

export default Graphics;