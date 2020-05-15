import * as THREE from 'three'
import React, { useRef, useMemo, useCallback, useEffect } from 'react'
import { useThree, useFrame } from 'react-three-fiber';

import vertexSilhouette from "../shaders/Silhouette.vert";
import fragmentSilhouette from "../shaders/Silhouette.frag";
import vertexShader from "../shaders/Key.vert";
import fragmentShader from "../shaders/Key.frag";
import Text from '../helpers/Text'

import { useSpring, a } from 'react-spring/three'
import * as easings from 'd3-ease'

const scratchObject3D = new THREE.Object3D();
const cameraVector3 = new THREE.Vector3();
function InstacedAvatar({ useStore, vidId, avatars, material }) {
  const hovered = useStore(state => state.hovered)
  const selected = useStore(state => state.selected)
  const setHovered = useStore(state => state.setHovered)
  const setSelected = useStore(state => state.setSelected)
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

  const spring = useSpring({
    opacity: hovered ? 1 : 0,
    config: { duration: 500, easing: easings.easeCubicInOut }
  }, [])

  const [instances, vidIds] = useMemo(() => {
    if (!hovered) return [null, null]
    const instances = hovered.array.map(o => o.instance)
    const vidIds = hovered.array.map(o => o.vidId)
    return [instances, vidIds]
  }, [hovered])

  useFrame(() => {
    if (!meshRef.current) return

    const cameraPos = cameraVector3.set(camera.position.x, 0, camera.position.z)
    for (let i = 0; i < avatars.length; ++i) {
      hoverArray[i] = (hovered && instances.includes(i) && vidIds.includes(vidId)) ? 1 - spring.opacity.value : Math.min(hoverArray[i] + 0.1, 1)

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
    if (!loadAnimDone || selected) return
    if (hovered && instances.includes(e.instanceId) && vidIds.includes(vidId)) return
    if (window.isMouseDown || window.isAnimating || window.isRotating) return

    document.body.style.cursor = 'pointer'
    setHovered({ array: [{ instance: e.instanceId, vidId }], setter: 'hover' })
  }

  const onPointerOut = () => {
    if (window.isMouseDown || window.isAnimating || window.isRotating) return
    document.body.style.cursor = 'auto'
    setHovered(undefined)
  }

  const onPointerDown = (e) => {
    if (window.isMouseDown || window.isAnimating || window.isRotating || !loadAnimDone) return
    if (instances.includes(e.instanceId) && vidIds.includes(vidId)) setSelected({ instance: e.instanceId, vidId })
  }

  const scale = 0.001
  return (
    <instancedMesh ref={onRefChange} args={[null, null, avatars.length]} frustumCulled={false}
      onPointerMove={e => onPointerMove(e)} onPointerOut={() => onPointerOut()} renderOrder={2}
      onPointerDown={e => onPointerDown(e)} position={[0, 444 * scale * 0.5, 0]}>
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
    const video = document.createElement('video');
    video.src = `assets/cartoonKey_trim.mp4`;
    video.loop = true
    video.muted = true
    video.id = `cartoon-video`
    video.load();
    video.play()

    const texture = new THREE.VideoTexture(video);
    // texture.minFilter = THREE.LinearFilter;
    // texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBFormat;
    texture.encoding = THREE.sRGBEncoding;

    const uniforms = Object.assign(THREE.ShaderLib["basic"].uniforms, {
      map: { value: texture },
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

  let maxAvatars = new Array(20).fill()

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

function VideoAvatar({ useStore, index, avatarArray, uniforms }) {
  const mesh = useRef(null)
  const group = useRef(null)

  const hovered = useStore(state => state.hovered)
  const studentData = useStore(state => state.studentData)
  const silhouetteVids = useStore(state => state.silhouetteVids)

  const scale = 0.000575
  const height = 852 * scale * 0.5
  const lookAt = useMemo(() => new THREE.Vector3(0, height, 0), [])

  const [data, name, visible] = useMemo(() => {
    if (!hovered || !hovered.array[index]) return [null, null, false]
    const hoveredUserId = hovered.array[index].instance * silhouetteVids + hovered.array[index].vidId
    const data = avatarArray[hoveredUserId]
    let name = studentData[hoveredUserId].name
    name = `${name.split(' ')[0]} ${name.split(' ')[1][0]}`
    return [data, name, true]
  }, [hovered])

  useSpring({
    opacity: visible ? 1 : 0,
    config: { duration: 500, easing: easings.easeCubicInOut },
    onFrame({ opacity }) {
      if (!mesh.current) return

      if (mesh.current.material.uniforms) {
        mesh.current.material.uniforms.uHover.value = opacity
        mesh.current.material.uniforms.uHover.needsUpdate = true
      }

      if (data) {
        group.current.position.set(
          data.x * (1 - opacity * 0.1) * 0.99,
          height,
          data.z * (1 - opacity * 0.1) * 0.99
        )
      } else {
        const dir = group.current.position.clone().normalize().multiplyScalar(0.025)
        group.current.position.x += dir.x
        group.current.position.z += dir.z
      }

      group.current.lookAt(lookAt)
      // group.current.rotation.y += Math.PI
    },
  }, [])

  useEffect(() => {
    group.current.position.y = -10
    mesh.current.renderOrder = 3;
    mesh.current.onBeforeRender = gl => {
      gl.clearDepth();
    };

    mesh.current.material = new THREE.ShaderMaterial({
      uniforms: Object.assign({}, uniforms),
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.DoubleSide,
      transparent: true
    }).clone()
  }, [])

  return (
    <group ref={group}>
      <mesh
        ref={mesh}>
        <planeBufferGeometry attach="geometry" args={[480 * scale, 852 * scale]} />
      </mesh>
      {name && <Text color="#fdfdfd" size={0.02} children={name} position={[0, -0.25, 0.1]} />}
    </group>
  )
}