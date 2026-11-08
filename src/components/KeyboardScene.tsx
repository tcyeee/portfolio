import { useEffect, useRef } from 'react'
import { PlayerAnimation, SkinViewer } from 'skinview3d'

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function smoothstep(t: number) {
  const c = clamp(t, 0, 1)
  return c * c * (3 - 2 * c)
}

interface Pose {
  legX: number
  legSpread: number
  bend: number
  headExtra: number
  armExtra: number
  dropY: number
}

const STAND: Pose = { legX: 0, legSpread: 0, bend: 0, headExtra: 0, armExtra: 0, dropY: 0 }
// Bends forward at the waist (legs stay straight) rather than bending the knees.
const BEND: Pose = { legX: 0, legSpread: 0, bend: 0.5, headExtra: -0.1, armExtra: 0.5, dropY: 0 }
const SIT: Pose = { legX: -0.9, legSpread: 0.55, bend: 0.1, headExtra: 0, armExtra: 0.15, dropY: -2.5 }

// Looped choreography timeline, in seconds: idle -> walk in place -> bend over -> sit -> stand back up
const IDLE_END = 2.5
const WALK_END = 6.5
const TO_BEND_END = 7.3
const BEND_END = 9.3
const TO_SIT_END = 10.1
const SIT_END = 13.5
const TO_STAND_END = 14.3
const CYCLE = 16.5

// Rest positions (local to `skin`) of the parts that ride along with a waist bend, and the
// waist pivot itself (where the body's local origin would be if it extended down to meet the
// legs) - since head/body/arms are siblings, not a bone chain, bending the torso has to
// manually carry them around this shared pivot instead of only rotating the body part.
const WAIST_PIVOT_Y = -12
const BODY_REST = { y: -6, z: 0 }
const HEAD_REST = { y: 0, z: 0 }
const LEFT_ARM_REST = { y: -2, z: 0 }
const RIGHT_ARM_REST = { y: -2, z: 0 }

function applyBend(part: any, rest: { y: number; z: number }, bend: number, extra: number) {
  const relY = rest.y - WAIST_PIVOT_Y
  part.position.y = WAIST_PIVOT_Y + relY * Math.cos(bend)
  part.position.z = rest.z + relY * Math.sin(bend)
  part.rotation.x = bend + extra
}

function applyPose(skin: any, player: any, from: Pose, to: Pose, t: number) {
  const legX = lerp(from.legX, to.legX, t)
  skin.leftLeg.rotation.x = legX
  skin.rightLeg.rotation.x = legX
  const legSpread = lerp(from.legSpread, to.legSpread, t)
  skin.leftLeg.rotation.z = legSpread
  skin.rightLeg.rotation.z = -legSpread

  const bend = lerp(from.bend, to.bend, t)
  const headExtra = lerp(from.headExtra, to.headExtra, t)
  const armExtra = lerp(from.armExtra, to.armExtra, t)
  applyBend(skin.body, BODY_REST, bend, 0)
  applyBend(skin.head, HEAD_REST, bend, headExtra)
  applyBend(skin.leftArm, LEFT_ARM_REST, bend, armExtra)
  applyBend(skin.rightArm, RIGHT_ARM_REST, bend, armExtra)

  player.position.y = lerp(from.dropY, to.dropY, t)
}

function idleSway(skin: any, t: number) {
  const s = Math.sin(t * 1.6)
  skin.leftArm.rotation.z = Math.PI * 0.02 + s * 0.02
  skin.rightArm.rotation.z = -Math.PI * 0.02 - s * 0.02
  skin.head.rotation.y = Math.sin(t * 0.8) * 0.08
}

function walkCycle(skin: any, t: number) {
  const speed = 7
  const swing = Math.sin(t * speed)
  skin.leftLeg.rotation.x = swing * 0.55
  skin.rightLeg.rotation.x = -swing * 0.55
  skin.leftArm.rotation.x = -swing * 0.45
  skin.rightArm.rotation.x = swing * 0.45
  skin.head.rotation.y = Math.sin(t * speed * 0.25) * 0.1
}

// Drives the mouse-follow yaw and the idle/walk/crouch/sit choreography on the standard
// Minecraft player rig (no bones file needed - skinview3d already provides the pivots).
class HeroAnimation extends PlayerAnimation {
  maxYaw = 0.35
  targetYaw = 0
  private currentYaw = 0

  animate(player: any, delta: number) {
    this.currentYaw = lerp(this.currentYaw, this.targetYaw, clamp(delta * 3, 0, 1))
    player.rotation.y = this.currentYaw * this.maxYaw

    const skin = player.skin
    const t = this.progress % CYCLE

    if (t < IDLE_END) {
      applyPose(skin, player, STAND, STAND, 1)
      idleSway(skin, t)
    } else if (t < WALK_END) {
      applyPose(skin, player, STAND, STAND, 1)
      walkCycle(skin, t - IDLE_END)
    } else if (t < TO_BEND_END) {
      applyPose(skin, player, STAND, BEND, smoothstep((t - WALK_END) / (TO_BEND_END - WALK_END)))
    } else if (t < BEND_END) {
      applyPose(skin, player, BEND, BEND, 1)
    } else if (t < TO_SIT_END) {
      applyPose(skin, player, BEND, SIT, smoothstep((t - BEND_END) / (TO_SIT_END - BEND_END)))
    } else if (t < SIT_END) {
      applyPose(skin, player, SIT, SIT, 1)
    } else if (t < TO_STAND_END) {
      applyPose(skin, player, SIT, STAND, smoothstep((t - SIT_END) / (TO_STAND_END - SIT_END)))
    } else {
      applyPose(skin, player, STAND, STAND, 1)
    }
  }
}

export default function KeyboardScene() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const viewer = new SkinViewer({
      canvas,
      width: container.clientWidth,
      height: container.clientHeight,
      enableControls: false,
      zoom: 0.45,
    })

    const heroAnimation = new HeroAnimation()
    viewer.animation = heroAnimation

    viewer.loadSkin('/images/skin.png').catch((error) => {
      console.error('Failed to load skin.png', error)
    })

    function handlePointerMove(event: PointerEvent) {
      // Normalize against the full viewport width (not just this half of the hero) so the
      // model keeps tracking the cursor as it moves across the right-hand content too.
      const x = (event.clientX / window.innerWidth) * 2 - 1
      heroAnimation.targetYaw = clamp(x, -1, 1)
    }
    window.addEventListener('pointermove', handlePointerMove)

    function handleResize() {
      if (!container) return
      viewer.width = container.clientWidth
      viewer.height = container.clientHeight
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('resize', handleResize)
      viewer.dispose()
    }
  }, [])

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full">
        <canvas ref={canvasRef} className="block w-full h-full" />
      </div>
    </div>
  )
}
