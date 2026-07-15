import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export default function KeyboardScene() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100)
    camera.position.set(0, -0.9, 2.4)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    container.appendChild(renderer.domElement)

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2)
    scene.add(ambientLight)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2)
    keyLight.position.set(3, 5, 4)
    scene.add(keyLight)
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.6)
    fillLight.position.set(-4, 2, -3)
    scene.add(fillLight)

    const maxYaw = 0.35
    const maxPitch = 0.15
    const targetRotation = new THREE.Vector2(0, 0)
    const currentRotation = new THREE.Vector2(0, 0)

    function handlePointerMove(event: PointerEvent) {
      const rect = container.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const y = ((event.clientY - rect.top) / rect.height) * 2 - 1
      targetRotation.set(THREE.MathUtils.clamp(x, -1, 1), THREE.MathUtils.clamp(y, -1, 1))
    }
    window.addEventListener('pointermove', handlePointerMove)

    // outerGroup stays world-aligned at rest so the mouse-driven yaw/pitch reads as a natural head-turn
    const outerGroup = new THREE.Group()
    scene.add(outerGroup)

    // tiltGroup bakes in the fixed orientation that faces the keyboard's key side toward the camera
    const tiltGroup = new THREE.Group()
    tiltGroup.rotation.x = Math.PI / 2
    outerGroup.add(tiltGroup)

    let model: THREE.Object3D | null = null
    const loader = new GLTFLoader()
    loader.load(
      '/Keyboard.glb',
      (gltf) => {
        model = gltf.scene
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = 0.8 / maxDim
        model.scale.setScalar(scale)
        tiltGroup.add(model)

        tiltGroup.updateWorldMatrix(true, true)
        const worldBox = new THREE.Box3().setFromObject(tiltGroup)
        const worldCenter = worldBox.getCenter(new THREE.Vector3())
        tiltGroup.position.sub(worldCenter)
      },
      undefined,
      (error) => {
        console.error('Failed to load Keyboard.glb', error)
      },
    )

    let frameId = 0
    function animate() {
      currentRotation.lerp(targetRotation, 0.05)
      outerGroup.rotation.y = currentRotation.x * maxYaw
      outerGroup.rotation.x = currentRotation.y * maxPitch
      renderer.render(scene, camera)
      frameId = requestAnimationFrame(animate)
    }
    animate()

    function handleResize() {
      if (!container) return
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('pointermove', handlePointerMove)
      renderer.dispose()
      container.removeChild(renderer.domElement)
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose()
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose())
          } else {
            child.material.dispose()
          }
        }
      })
    }
  }, [])

  return <div ref={containerRef} className="w-full h-full" />
}
