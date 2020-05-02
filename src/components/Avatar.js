import * as THREE from 'three'
import React, { useMemo, useEffect, useRef } from 'react'
import { useFrame, useThree } from 'react-three-fiber';
import { useSpring, a } from 'react-spring/three'
import * as easings from 'd3-ease'
import KeyMaterial from "../shaders/KeyMaterial"

export default function Avatar({ useStore }) {
  const meshRef = useRef();
  const videoRef = useRef();
  const { camera } = useThree()

  useEffect(() => {
    if (true) {
      meshRef.current.visible = true
      if (videoRef.current) videoRef.current.play()
    }
    else {
      meshRef.current.visible = false
      if (videoRef.current) videoRef.current.pause()
      if (videoRef.current) videoRef.current.currentTime = 0;
    }
  }, [])

  const receptionistTex = useMemo(() => {
    const video = document.createElement('video');
    video.src = "assets/avatar.mp4";
    video.loop = true
    video.muted = true
    video.load();
    videoRef.current = video

    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBFormat;
    return texture
  }, [])

  const keyMaterial = React.useMemo(() => {
    receptionistTex.encoding = THREE.sRGBEncoding;
    return new KeyMaterial({
      texture0: receptionistTex,
      lum: new THREE.Vector2(1, 1)
    })
  }, [])

  useEffect(() => {
    if (meshRef.current) meshRef.current.material = keyMaterial
  }, [meshRef.current])

  useFrame(() => {
    if (!meshRef.current) return
    meshRef.current.lookAt(camera.position.clone().setComponent(1, 0))
  })

  const spring = useSpring({
    opacity: true ? 1 : 0,
    config: { duration: 500, easing: easings.easeCubicInOut }
  })

  const scale = 0.001
  return (
    <>
      <mesh
        ref={meshRef}
        position={[0, 0, 2]}>
        <planeGeometry attach="geometry" args={[280 * scale, 480 * scale]} />
        <meshLambertMaterial attach="material" side={THREE.DoubleSide} />
      </mesh>
    </>
  )
}