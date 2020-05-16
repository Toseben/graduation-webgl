import * as THREE from 'three'
import React, { useRef, useMemo, useEffect } from 'react'
import vertexShader from "../shaders/Key.vert";
import fragmentShader from "../shaders/Key.frag";
import Text from '../helpers/Text'

import { useSpring } from 'react-spring/three'
import * as easings from 'd3-ease'

export default function VideoAvatar({ useStore, index, avatarArray, uniforms }) {
  const videoAvatarRef = useRef(null)
  const group = useRef(null)

  const hovered = useStore(state => state.hovered)
  const studentData = useStore(state => state.studentData)
  const silhouetteVids = useStore(state => state.silhouetteVids)

  const scale = 0.000575
  const height = 852 * scale * 0.5
  const lookAt = useMemo(() => new THREE.Vector3(0, height, 0), [])

  const onLoaded = material => {
    setTimeout(() => {
      material.visible = true
      material.needsUpdate = true
      // console.log('visible = true')
    }, 400)
  }

  const [data, name, visible] = useMemo(() => {
    if (!hovered || !hovered.array[index]) return [null, null, false]
    const hoveredUserId = hovered.array[index].instance * silhouetteVids + hovered.array[index].vidId
    const data = avatarArray[hoveredUserId]
    let name = studentData[hoveredUserId].name
    name = `${name.split(' ')[0]} ${name.split(' ')[1][0]}`

    if (videoAvatarRef.current.material.uniforms) {
      // console.log('visible = false')
      videoAvatarRef.current.material.visible = false
      videoAvatarRef.current.material.needsUpdate = true

      const video = videoAvatarRef.current.material.uniforms.map.value.image
      video.removeEventListener('loadeddata', onLoaded)
      video.pause();
      video.src = "";

      setTimeout(() => {
        video.addEventListener('loadeddata', onLoaded(videoAvatarRef.current.material), false);
        const videoPath = studentData[hoveredUserId].largeVideoPath.replace('largeVideos', 'dataStructure/largeVideos')
        video.setAttribute('src', videoPath);
        video.load();
        video.play();
      }, 100)
    }

    return [data, name, true]
  }, [hovered])

  useSpring({
    opacity: visible ? 1 : 0,
    config: { duration: 500, easing: easings.easeCubicInOut },
    onFrame({ opacity }) {
      if (!videoAvatarRef.current) return

      if (videoAvatarRef.current.material.uniforms) {
        videoAvatarRef.current.material.uniforms.uHover.value = opacity
        videoAvatarRef.current.material.uniforms.uHover.needsUpdate = true
      }

      if (data) {
        group.current.position.set(
          data.x * (1 - opacity * 0.2) * 0.99,
          height,
          data.z * (1 - opacity * 0.2) * 0.99
        )
      } else {
        const dir = group.current.position.clone().normalize().multiplyScalar(0.025)
        group.current.position.x += dir.x
        group.current.position.z += dir.z
      }

      group.current.lookAt(lookAt)
    },
  }, [])

  useEffect(() => {
    group.current.position.y = -10
    videoAvatarRef.current.renderOrder = 3;
    videoAvatarRef.current.onBeforeRender = gl => {
      gl.clearDepth();
    };

    const video = document.createElement('video');
    video.loop = true
    video.muted = true
    video.id = `cartoon-video-${index}`

    const texture = new THREE.VideoTexture(video);
    texture.format = THREE.RGBFormat;
    texture.encoding = THREE.sRGBEncoding;

    videoAvatarRef.current.material = new THREE.ShaderMaterial({
      uniforms: Object.assign(uniforms, { map: { type: 't', value: texture } }),
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.DoubleSide,
      transparent: true
    }).clone()
  }, [])

  return (
    <group ref={group}>
      <mesh
        ref={videoAvatarRef}>
        <planeBufferGeometry attach="geometry" args={[480 * scale, 852 * scale]} />
      </mesh>
      {name && hovered.array.length === 1 && <Text color="#fdfdfd" size={0.03} children={name} position={[0, -0.25, 0.1]} />}
    </group>
  )
}