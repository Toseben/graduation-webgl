import * as THREE from 'three'
import React, { Suspense, useMemo, useRef, useEffect } from 'react'
import { Canvas, useFrame, useLoader } from 'react-three-fiber';
// import Stats from 'stats.js'

import Avatars from "./Avatars"
import FollowLight from "./FollowLight"
import ControlsOrbit from "./ControlsOrbit"
import GroundReflector from "./GroundReflector"
import Galaxy from "./Galaxy"
import BackgroundParticles from "./BackgroundParticles"
import Text from '../helpers/Text'

// function FPS({ useStore }) {
//   const stats = useRef()

//   useEffect(() => {
//     stats.current = new Stats();
//     stats.current.showPanel(0);
//     stats.current.dom.classList.add('stats');
//     document.body.appendChild(stats.current.dom);
//   }, [])

//   useFrame(() => {
//     if (!stats.current) return
//     stats.current.begin();
//     stats.current.end();
//   })

//   return (
//     <></>
//   )
// }

function ChromaKey({ useStore }) {
  const selected = useStore(state => state.selected)
  const [video, ctx1, ctx2] = useMemo(() => {
    const video = document.getElementById("video");
    const ctx1 = document.getElementById("c1").getContext("2d");
    const ctx2 = document.getElementById("c2").getContext("2d");
    return [video, ctx1, ctx2]
  }, [])

  const smoothstep = (lowerBound, upperBound, value) => {
    var clippedValue = value > upperBound ? upperBound : value < lowerBound ? lowerBound : value;
    var normalizedValue = (clippedValue - lowerBound) / (upperBound - lowerBound);
    return normalizedValue * normalizedValue * (3 - 2 * normalizedValue);
  }

  useFrame(() => {
    if (!selected || !video || !ctx1 || !ctx2) return
    const width = 735
    const height = 1080
    ctx1.drawImage(video, 0, 0, width, height);

    let frame = ctx1.getImageData(0, 0, width, height);
    let l = frame.data.length / 4;

    for (let i = 0; i < l; i++) {
      let r = frame.data[i * 4 + 0];
      let g = frame.data[i * 4 + 1];
      let b = frame.data[i * 4 + 2];
      g -= r > b ? r : b
      frame.data[i * 4 + 3] = 255 - smoothstep(0, 0.1, g / 255) * 255;
    }
    ctx2.putImageData(frame, 0, 0);
  })

  return (
    <></>
  )
}

const HelmetLogo = () => {
  const helmetWhite = useLoader(THREE.TextureLoader, 'assets/helmetGlow.png')
  const helmet = useRef()

  useEffect(() => {
    helmet.current.renderOrder = 3;
    helmet.current.onBeforeRender = gl => {
      gl.clearDepth();
    };
  }, [])

  return (
    <mesh ref={helmet} position={[0, 3, -20]} rotation={[0, 0, 0]}>
      <planeBufferGeometry attach="geometry" args={[3, 3]} />
      <meshBasicMaterial attach="material" map={helmetWhite} side={THREE.DoubleSide} transparent />
    </mesh>
  );
}

const Graphics = ({ useStore }) => {
  const loaded = useStore(state => state.loaded)

  return (
    <Canvas
      gl={{ antialias: true }}
      camera={{
        far: 10000,
        near: 0.1,
        fov: 25,
        position: [-15 * 250, 10 * 250, -15 * 250]
      }}>

      {/* <ChromaKey useStore={useStore} /> */}
      <Suspense fallback={null}>
        <Avatars useStore={useStore} />
        <FollowLight useStore={useStore} />
        <GroundReflector useStore={useStore} />
        <BackgroundParticles useStore={useStore} />
        <Galaxy useStore={useStore} />
        <HelmetLogo />
      </Suspense>

      <Text color="#fdfdfd" size={0.25} children={'Lyman Briggs College'} rotation={[0, Math.PI, 0]} position={[0, 3.25, 20]} />}
      <Text color="#fdfdfd" size={0.2} children={'Commencement 2020'} rotation={[0, Math.PI, 0]} position={[0, 2.75, 20]} />}

      {loaded &&
        <ControlsOrbit useStore={useStore} />
      }
    </Canvas>
  );
};

export default Graphics;