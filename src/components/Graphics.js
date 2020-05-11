import React, { Suspense, useRef, useEffect, useMemo } from 'react'
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
    if (!selected) return

    const width = 480
    const height = 852
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
      <ChromaKey useStore={useStore} />
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