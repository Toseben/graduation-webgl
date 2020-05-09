import * as THREE from 'three'
import React, { useRef, useMemo, useEffect } from 'react'

export default function BackgroundVid({ useStore }) {
  const group = useRef()
  const mesh = useRef()

  const particleTex = useMemo(() => {
    const video = document.createElement('video');
    video.src = `assets/slowParticles.mp4`;
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
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

    const scaleVid = 0.075;
    texture.repeat.set(1, 1 - scaleVid * 2)
    texture.offset.set(0, scaleVid)

    return texture
  }, [])

  const scale = 0.00525
  const windowResize = () => {
    const aspect = window.innerWidth / window.innerHeight;
    if (aspect > 1) {
      mesh.current.scale.set(aspect, aspect, aspect)
      mesh.current.position.set(0, 354 * scale * aspect * 0.5, -5)
    } else {
      const staticScale = 1.25
      mesh.current.scale.set(staticScale, staticScale, staticScale)
      mesh.current.position.set(0, 354 * scale * staticScale * 0.5, -5)
    }
  }

  useEffect(() => {
    windowResize()
    window.addEventListener('resize', windowResize)
    return () => {
      window.removeEventListener('resize', windowResize)
    }
  }, [])

  return (
    <group ref={group} name="background">
      <group ref={mesh}>
        <mesh>
          <planeGeometry attach="geometry" args={[720 * scale, 354 * scale]} />
          <meshBasicMaterial attach="material" map={particleTex} />
        </mesh>
      </group>
    </group>
  )
}