import React, { Suspense, useRef, useEffect } from 'react'
import { Canvas, useFrame } from 'react-three-fiber';
import Stats from 'stats.js'

import Avatars from "./Avatars"
import BackgroundVid from "./BackgroundVid"
import ControlsOrbit from "./ControlsOrbit"
import GroundReflector from "./GroundReflector"

function FPS({ useStore }) {
  const stats = useRef()
  useEffect(() => {
    stats.current = new Stats();
    stats.current.showPanel(0);
    stats.current.dom.classList.add('stats');
    document.body.appendChild(stats.current.dom);
  }, [])

  useFrame(() => {
    if (!stats.current) return
    stats.current.begin();
    stats.current.end();
  })

  return (
    <></>
  )
}

const Graphics = ({ useStore }) => {
  const loaded = useStore(state => state.loaded)

  return (
    <Canvas
      gl={{ antialias: false }}
      camera={{
        far: 100, 
        near: 0.01, 
        fov: 40 * 1
      }}>

      {/* <FPS useStore={useStore} /> */}
      <Suspense fallback={null}>
        <Avatars useStore={useStore} />
        <BackgroundVid useStore={useStore} />
        <GroundReflector useStore={useStore} />
      </Suspense>

      {loaded &&
        <ControlsOrbit useStore={useStore} />
      }
    </Canvas>
  );
};

export default Graphics;