import * as THREE from 'three'
import React, { useRef, useMemo, useEffect } from 'react'

import vertexSilhouette from "../shaders/Silhouette.vert";
import fragmentSilhouette from "../shaders/Silhouette.frag";
import InstacedAvatar from './InstacedAvatar'
import VideoAvatar from './VideoAvatar'

export default function Avatars({ useStore }) {
  const avatarNames = useRef()
  const silhouetteVids = useStore(state => state.silhouetteVids)
  const studentData = useStore(state => state.studentData)

  const radius = 3.75
  const avatarArray = studentData.map((user, idx) => {
    const x = Math.sin(idx / studentData.length * Math.PI * 2) * radius
    const z = Math.cos(idx / studentData.length * Math.PI * 2) * radius
    return { x, z, userId: user.userId }
  })

  const videoArray = useMemo(() => {
    let videoArray = new Array(silhouetteVids).fill(null)
    return videoArray.map((node, idx) => {
      const video = document.createElement('video');
      video.src = `assets/silhouettes/${idx + 1}.mp4`;
      video.loop = true
      video.muted = true
      video.id = `video-${idx}`
      video.load();

      // video.currentTime = idx / videoArray.length * 1.8
      video.play()

      const texture = new THREE.VideoTexture(video);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.format = THREE.RGBFormat;
      texture.encoding = THREE.sRGBEncoding;

      const uniforms = Object.assign(THREE.ShaderLib["basic"].uniforms, {
        map: { value: texture },
        lum: { value: new THREE.Vector2(0.0, 0.1) }
      });

      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: vertexSilhouette,
        fragmentShader: fragmentSilhouette,
        transparent: true,
        side: THREE.DoubleSide
      }).clone()

      return { video, texture, material }
    })
  }, [])

  const cartoonVidUniforms = useMemo(() => {
    const uniforms = Object.assign(THREE.ShaderLib["basic"].uniforms, {
      lum: { value: new THREE.Vector2(0.0, 0.1) },
      uHover: { value: 0 },
    });

    return uniforms
  }, [])

  const scale = 0.000575
  useEffect(() => {
    if (!avatarNames.current) return
    avatarNames.current.children.forEach(avatar => {
      avatar.lookAt(new THREE.Vector3(0, 852 * scale * 0.5, 0))
    })
  }, [])

  let maxAvatars = new Array(32).fill()

  return (
    <group name="avatarParent">
      <group name="avatarGroup">
        {videoArray.map((video, idx) => {
          return <InstacedAvatar key={idx} useStore={useStore} vidId={idx} avatars={avatarArray.filter((avatar, i) => i % silhouetteVids === idx)} material={video.material} />
        })}
      </group>
      <group>
        {maxAvatars.map((pos, idx) => {
          return (
            <VideoAvatar key={idx} useStore={useStore} index={idx} avatarArray={avatarArray} uniforms={cartoonVidUniforms} />
          )
        })}
      </group>
    </group>
  )
}