import * as THREE from 'three'
import React, { useRef, useMemo, useCallback, useEffect } from 'react'
import { useThree, useFrame } from 'react-three-fiber';

import vertexShader from "../shaders/Key.vert";
import fragmentShader from "../shaders/Key.frag";
import Text from '../helpers/Text'

const scratchObject3D = new THREE.Object3D();
const cameraVector3 = new THREE.Vector3();
function InstacedAvatar({ useStore, vidId, avatars, material }) {
  const hovered = useStore(state => state.hovered)
  const setHovered = useStore(state => state.setHovered)
  const loadAnimDone = useStore(state => state.loadAnimDone)

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

  const hoverArray = useMemo(() => {
    const color = new Float32Array(avatars.length)
    for (let i = 0; i < avatars.length; ++i) {
      color[i] = 1
    }
    return color
  }, [])

  useFrame(() => {
    if (!meshRef.current) return

    const cameraPos = cameraVector3.set(camera.position.x, 0, camera.position.z)
    for (let i = 0; i < avatars.length; ++i) {
      hoverArray[i] = (hovered && i === hovered.instance && vidId === hovered.vidId) ? Math.max(hoverArray[i] - 0.1, 0) : Math.min(hoverArray[i] + 0.1, 1)

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
    if (!loadAnimDone) return
    if (hovered) {
      if (e.instanceId === hovered.instance && vidId === hovered.vidId) return
    }
    setHovered({ instance: e.instanceId, vidId, setter: 'hover' })
  }

  const scale = 0.001
  return (
    <instancedMesh ref={onRefChange} args={[null, null, avatars.length]} frustumCulled={false}
      onPointerOver={e => onPointerMove(e)} onPointerOut={e => setHovered(undefined)} position={[0, 444 * scale * 0.5, 0]}>
      <planeBufferGeometry attach="geometry" args={[204 * scale, 444 * scale]}>
        <instancedBufferAttribute
          attachObject={['attributes', 'hover']}
          args={[hoverArray, 1]}
        />
      </planeBufferGeometry>
    </instancedMesh>
  )
}

export default function Avatars({ useStore }) {
  const avatarNames = useRef()
  const silhouetteVids = useStore(state => state.silhouetteVids)
  const setLoaded = useStore(state => state.setLoaded)
  const studentData = useStore(state => state.studentData)
  const hovered = useStore(state => state.hovered)

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
      video.src = `assets/avatar_crop.webm`;
      video.loop = true
      video.muted = true
      video.id = `video-${idx}`
      video.load();

      video.currentTime = idx / videoArray.length * 1.8
      video.play()

      const texture = new THREE.VideoTexture(video);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.format = THREE.RGBFormat;
      texture.encoding = THREE.sRGBEncoding;
      texture.generateMipmaps = true

      const uniforms = Object.assign(THREE.ShaderLib["basic"].uniforms, {
        map: { value: texture },
        lum: { value: new THREE.Vector2(0.0, 0.1) },
      });

      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
        transparent: true,
        side: THREE.DoubleSide,
        defines: {
          HOVER: ''
        }
      }).clone()

      setLoaded(true)
      return { video, texture, material }
    })
  }, [])

  const cartoonVidMat = useMemo(() => {
    const video = document.createElement('video');
    video.src = `assets/cartoonKey.mp4`;
    video.loop = true
    video.muted = true
    video.id = `cartoon-video`
    video.load();
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
    })

    return material
  }, [])

  useEffect(() => {
    if (!avatarNames.current) return
    avatarNames.current.children.forEach(avatar => {
      avatar.lookAt(new THREE.Vector3(0, 0.5, 0))
      if (avatar.name === 'real-video') {
        avatar.material = cartoonVidMat
      }
    })
  }, [])

  const scale = 0.000575
  const hoveredUserId = hovered ? hovered.instance * silhouetteVids + hovered.vidId : null
  return (
    <group name="avatarParent">
      <group name="avatarGroup">
        {videoArray.map((video, idx) => {
          return <InstacedAvatar key={idx} useStore={useStore} vidId={idx} avatars={avatarArray.filter((avatar, i) => i % silhouetteVids === idx)} material={video.material} />
        })}
      </group>
      <group ref={avatarNames}>
        {avatarArray.map((pos, idx) => {
          const name = studentData[idx].name.split(' ')[0]

          return (
            <>
              <Text key={idx} visible={hoveredUserId === idx} color="#fdfdfd" size={0.04} position={[pos.x, -0.05, pos.z]} children={name} />
              <mesh key={`user-${idx}`} name={`real-video`} visible={hoveredUserId === idx} position={[pos.x, 852 * scale * 0.5, pos.z]}>
                <planeBufferGeometry attach="geometry" args={[480 * scale, 852 * scale]} />
                <meshStandardMaterial attach="material" color="hotpink" side={THREE.DoubleSide} />
              </mesh>
            </>
          )
        })}
      </group>
    </group>
  )
}