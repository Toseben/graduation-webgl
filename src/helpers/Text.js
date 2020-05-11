import * as THREE from 'three'
import React, { useState, useMemo } from 'react'
import fontFile from './GothamMedium'

export default function Text({ children, size = 1, letterSpacing = 0.01, color = '#000000', centerX = true, centerY = true, ...props }) {
  const [font] = useState(() => new THREE.FontLoader().parse(fontFile))
  const [shapes, [x, y]] = useMemo(() => {
    let x = 0,
      y = 0
    let letters = [...String(children)]
    let mat = new THREE.MeshBasicMaterial({ color, opacity: 1, transparent: true, side: THREE.DoubleSide, depthTest: false })
    return [
      letters.map(letter => {
        const geom = new THREE.ShapeBufferGeometry(font.generateShapes(letter, size, 1))
        geom.computeBoundingBox()
        if (letter === ' ') console.log(geom)
        const mesh = new THREE.Mesh(geom, mat)
        mesh.renderOrder = 2

        mesh.position.x = x
        x += geom.boundingBox.max.x + letterSpacing
        y = Math.max(y, geom.boundingBox.max.y)
        return mesh
      }),
      [x, y]
    ]
  }, [])
  return (
    <group {...props}>
      <group position={[centerX ? -x / 2 : 0, centerY ? -y / 2 : 0, 0]}>
        {shapes.map((shape, index) => (
          <primitive key={index} object={shape} />
        ))}
      </group>
    </group>
  )
}
