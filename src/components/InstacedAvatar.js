import * as THREE from 'three'
import React, { useRef, useMemo, useCallback, useEffect } from 'react'
import { useThree, useFrame } from 'react-three-fiber';

import { useSpring } from 'react-spring/three'
import * as easings from 'd3-ease'

const scratchObject3D = new THREE.Object3D();
const cameraVector3 = new THREE.Vector3();
export default function InstacedAvatar({ useStore, vidId, avatars, material }) {
  const hovered = useStore(state => state.hovered)
  const selected = useStore(state => state.selected)
  const setHovered = useStore(state => state.setHovered)
  const setSelected = useStore(state => state.setSelected)
  const loadAnimDone = useStore(state => state.loadAnimDone)
  const speech = useStore(state => state.speech)

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
    if (!loadAnimDone || selected || speech !== 3) return
    if (hovered && instances.includes(e.instanceId) && vidIds.includes(vidId)) return
    if (window.isMouseDown || window.isAnimating || window.isRotating) return
    if (hovered && hovered.array.length > 1) return

    document.body.style.cursor = 'pointer'
    setHovered({ array: [{ instance: e.instanceId, vidId }], setter: 'hover' })
  }

  const onPointerOut = () => {
    if (window.isMouseDown || window.isAnimating || window.isRotating || speech !== 3) return
    if (hovered && hovered.array.length > 1) return
    
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