import * as THREE from 'three'
import React, { useRef, useMemo, useEffect } from 'react'
import { useLoader } from "react-three-fiber"
import { useSpring, a } from 'react-spring/three'

export default function BackgroundVid({ useStore }) {
  const group = useRef()
  // const mesh = useRef()
  // const setLoaded = useStore(state => state.setLoaded)

  // const particleTex = useMemo(() => {
  //   const video = document.createElement('video');
  //   video.src = `assets/slowParticles_green.mp4`;
  //   video.loop = true
  //   video.muted = true
  //   video.id = `video-particles`
  //   video.load();
  //   video.play();

  //   const texture = new THREE.VideoTexture(video);
  //   texture.minFilter = THREE.LinearFilter;
  //   texture.magFilter = THREE.LinearFilter;
  //   texture.format = THREE.RGBFormat;
  //   texture.encoding = THREE.sRGBEncoding;
  //   texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;

  //   const scaleVid = 0.075;
  //   texture.repeat.set(1, 1 - scaleVid * 2)
  //   texture.offset.set(0, scaleVid)

  //   return texture
  // }, [])

  // const scale = 0.00525
  // const windowResize = () => {
  //   const aspect = window.innerWidth / window.innerHeight;
  //   if (aspect > 1) {
  //     mesh.current.scale.set(aspect, aspect, aspect)
  //     mesh.current.position.set(0, 354 * scale * aspect * 0.5, -5)
  //   } else {
  //     const staticScale = 1.25
  //     mesh.current.scale.set(staticScale, staticScale, staticScale)
  //     mesh.current.position.set(0, 354 * scale * staticScale * 0.5, -5)
  //   }
  // }

  const calc = (x, y) => [(x - window.innerWidth / 2), (y - window.innerHeight / 2) * -1]
  const [props, set] = useSpring(() => ({ xy: [0, 0], config: { mass: 10, tension: 550, friction: 140 } }))

  const onMouseMove = e => {
    set({ xy: calc(e.pageX, e.pageY) })
  }

  useEffect(() => {
    // windowResize()
    // window.addEventListener('resize', windowResize)
    window.addEventListener('mousemove', onMouseMove)
    // setLoaded(true)
    return () => {
      // window.removeEventListener('resize', windowResize)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  const cursorTex = useLoader(THREE.TextureLoader, 'assets/lensflare.png')

  return (
    <group ref={group} name="background">
      <a.mesh position={props.xy.interpolate((x, y) => [x * 0.0035, y * 0.0015 + 1, -4])}>
        <planeBufferGeometry attach="geometry" args={[0.75, 0.75]} />
        <meshBasicMaterial attach="material" map={cursorTex} transparent depthTest={false} blending={THREE.AdditiveBlending} />
      </a.mesh>
      <a.mesh position={props.xy.interpolate((x, y) => [x * 0.0035, y * 0.0015 + 1, -4])}>
        <sphereBufferGeometry attach="geometry" args={[0.02, 16, 16]} />
        <meshBasicMaterial attach="material"/>
      </a.mesh>

      {/* <group ref={mesh}>
        <mesh>
          <planeBufferGeometry attach="geometry" args={[720 * scale, 354 * scale]} />
          <meshBasicMaterial attach="material" map={particleTex} />
        </mesh>
      </group> */}
    </group>
  )
}