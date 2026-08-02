import { useEffect, useId, useRef } from "react"
import type { Transition, Variants } from "motion/react"
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react"

const transition: Transition = {
  type: "spring",
  mass: 0.5,
  damping: 18,
  stiffness: 200,
}

// ViewBox size computed from the isometric grid below.
const VB_W = 531.62
const VB_H = 352

// Vertical press offset.
const PRESS_OFFSET = 6

const TOP_FACES_D =
  "M144.56 146.00 L179.21 126.00 L213.85 146.00 L179.21 166.00 Z M317.77 206.00 L352.41 186.00 L387.05 206.00 L352.41 226.00 Z M213.85 146.00 L248.49 126.00 L283.13 146.00 L248.49 166.00 Z M283.13 66.00 L317.77 46.00 L352.41 66.00 L317.77 86.00 Z M387.05 86.00 L421.69 66.00 L456.33 86.00 L421.69 106.00 Z M75.28 266.00 L109.92 246.00 L144.56 266.00 L109.92 286.00 Z M352.41 26.00 L387.05 6.00 L421.69 26.00 L387.05 46.00 Z M144.56 266.00 L179.21 246.00 L213.85 266.00 L179.21 286.00 Z M179.21 126.00 L213.85 106.00 L248.49 126.00 L213.85 146.00 Z M283.13 186.00 L317.77 166.00 L352.41 186.00 L317.77 206.00 Z M352.41 66.00 L387.05 46.00 L421.69 66.00 L387.05 86.00 Z M456.33 126.00 L490.97 106.00 L525.62 126.00 L490.97 146.00 Z M40.64 246.00 L75.28 226.00 L109.92 246.00 L75.28 266.00 Z M213.85 266.00 L248.49 246.00 L283.13 266.00 L248.49 286.00 Z M144.56 306.00 L179.21 286.00 L213.85 306.00 L179.21 326.00 Z M352.41 186.00 L387.05 166.00 L421.69 186.00 L387.05 206.00 Z M248.49 166.00 L283.13 146.00 L317.77 166.00 L283.13 186.00 Z M283.13 226.00 L317.77 206.00 L352.41 226.00 L317.77 246.00 Z M317.77 46.00 L352.41 26.00 L387.05 46.00 L352.41 66.00 Z M421.69 106.00 L456.33 86.00 L490.97 106.00 L456.33 126.00 Z M6.00 226.00 L40.64 206.00 L75.28 226.00 L40.64 246.00 Z M75.28 226.00 L109.92 206.00 L144.56 226.00 L109.92 246.00 Z M109.92 286.00 L144.56 266.00 L179.21 286.00 L144.56 306.00 Z M75.28 186.00 L109.92 166.00 L144.56 186.00 L109.92 206.00 Z M213.85 106.00 L248.49 86.00 L283.13 106.00 L248.49 126.00 Z"

const SIDE_FACES_D =
  "M179.21 166.00 L213.85 146.00 L213.85 166.00 L179.21 186.00 Z M352.41 226.00 L387.05 206.00 L387.05 226.00 L352.41 246.00 Z M248.49 126.00 L283.13 146.00 L283.13 166.00 L248.49 146.00 Z M317.77 86.00 L352.41 66.00 L352.41 86.00 L317.77 106.00 Z M421.69 66.00 L456.33 86.00 L456.33 106.00 L421.69 86.00 Z M109.92 246.00 L144.56 266.00 L144.56 286.00 L109.92 266.00 Z M387.05 6.00 L421.69 26.00 L421.69 46.00 L387.05 26.00 Z M387.05 46.00 L421.69 26.00 L421.69 46.00 L387.05 66.00 Z M179.21 246.00 L213.85 266.00 L213.85 286.00 L179.21 266.00 Z M179.21 286.00 L213.85 266.00 L213.85 286.00 L179.21 306.00 Z M317.77 166.00 L352.41 186.00 L352.41 206.00 L317.77 186.00 Z M387.05 46.00 L421.69 66.00 L421.69 86.00 L387.05 66.00 Z M490.97 106.00 L525.62 126.00 L525.62 146.00 L490.97 126.00 Z M490.97 146.00 L525.62 126.00 L525.62 146.00 L490.97 166.00 Z M248.49 246.00 L283.13 266.00 L283.13 286.00 L248.49 266.00 Z M248.49 286.00 L283.13 266.00 L283.13 286.00 L248.49 306.00 Z M179.21 286.00 L213.85 306.00 L213.85 326.00 L179.21 306.00 Z M179.21 326.00 L213.85 306.00 L213.85 326.00 L179.21 346.00 Z M387.05 166.00 L421.69 186.00 L421.69 206.00 L387.05 186.00 Z M387.05 206.00 L421.69 186.00 L421.69 206.00 L387.05 226.00 Z M283.13 146.00 L317.77 166.00 L317.77 186.00 L283.13 166.00 Z M317.77 246.00 L352.41 226.00 L352.41 246.00 L317.77 266.00 Z M456.33 86.00 L490.97 106.00 L490.97 126.00 L456.33 106.00 Z M40.64 206.00 L75.28 226.00 L75.28 246.00 L40.64 226.00 Z M109.92 206.00 L144.56 226.00 L144.56 246.00 L109.92 226.00 Z M109.92 246.00 L144.56 226.00 L144.56 246.00 L109.92 266.00 Z M109.92 166.00 L144.56 186.00 L144.56 206.00 L109.92 186.00 Z M109.92 206.00 L144.56 186.00 L144.56 206.00 L109.92 226.00 Z M248.49 86.00 L283.13 106.00 L283.13 126.00 L248.49 106.00 Z M248.49 126.00 L283.13 106.00 L283.13 126.00 L248.49 146.00 Z"

const ALL_FACES_D = `${TOP_FACES_D} ${SIDE_FACES_D}`

// Extra lower contour lines based on the red marks in the reference image.
const OUTER_EDGE_D = `
  M283.13 66
  L283.13 86
  L317.77 106

  M352.41 86
  L387.05 106
  L421.69 126
  L456.33 146
  L490.97 166

  M144.56 146
  L144.56 166
  L179.21 186

  M213.85 166
  L248.49 186
  L283.13 206
  L300.45 216

  M283.13 226
  L283.13 246
  L317.77 266

  M75.28 186
  L75.28 206
  L109.92 226

  M6 226
  L6 246
  L40.64 266
  L75.28 286
  L109.92 306
  L144.56 326
  L179.21 346

  M213.85 266
  L213.85 286
  L248.49 306
`

const logoVariants: Variants = {
  normal: {
    transform: "translate(0px, 0px)",
  },
  pressed: {
    transform: `translate(0px, ${PRESS_OFFSET}px)`,
  },
}

export function SpotlightLogo() {
  const id = useId().replace(/:/g, "")

  const ids = {
    facePattern: `kit-logo-face-pattern-${id}`,
    stroke: `kit-logo-stroke-${id}`,
    radialGradient: `kit-logo-radial-gradient-${id}`,
  }

  const ref = useRef<SVGSVGElement>(null)

  const shouldReduceMotion = useReducedMotion()
  const isInView = useInView(ref, { margin: "80px" })

  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)

  const cx = useSpring(useTransform(mouseX, [0, 1], [0, VB_W]), {
    stiffness: 300,
    damping: 30,
    mass: 0.1,
  })

  const cy = useSpring(useTransform(mouseY, [0, 1], [0, VB_H]), {
    stiffness: 300,
    damping: 30,
    mass: 0.1,
  })

  useEffect(() => {
    if (shouldReduceMotion || !isInView) {
      return
    }

    if (window.matchMedia("(hover: none)").matches) {
      return
    }

    const handleMouseMove = (event: MouseEvent) => {
      mouseX.set(event.clientX / window.innerWidth)
      mouseY.set(event.clientY / window.innerHeight)
    }

    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [shouldReduceMotion, isInView, mouseX, mouseY])

  return (
    <motion.svg
      ref={ref}
      className="
        h-auto w-full touch-manipulation
        [--top:rgba(2,6,23,0.06)]
        [--side:rgba(2,6,23,0.12)]
        [--pattern:rgba(2,6,23,0.28)]
        [--stroke:rgba(2,6,23,0.72)]
        [--outer-edge:rgba(2,6,23,0.72)]
      "
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      initial="normal"
      whileTap="pressed"
    >
      <defs>
        <pattern
          id={ids.facePattern}
          x="0"
          y="0"
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M-1 1l2 -2M0 8l8 -8M7 9l2 -2"
            stroke="var(--pattern)"
            strokeWidth="1"
          />
        </pattern>

        <path id={ids.stroke} d={ALL_FACES_D} />

        <motion.radialGradient
          id={ids.radialGradient}
          cx={cx}
          cy={cy}
          r="170"
          gradientUnits="userSpaceOnUse"
        >
          <stop
            className="dark:[stop-color:#fff]"
            stopColor="rgba(2,6,23,0.95)"
          />
          <stop
            className="dark:[stop-color:var(--color-zinc-600)]"
            offset="1"
            stopColor="rgba(2,6,23,0.28)"
            stopOpacity="0"
          />
        </motion.radialGradient>
      </defs>

      <motion.g variants={logoVariants} transition={transition}>
        {/* Side faces */}
        <path d={SIDE_FACES_D} fill="var(--side)" />

        {/* Top faces */}
        <path d={TOP_FACES_D} fill="var(--top)" />

        {/* Hatch pattern */}
        <path d={TOP_FACES_D} fill={`url(#${ids.facePattern})`} />

        {/* Base outline */}
        <use
          href={`#${ids.stroke}`}
          stroke="var(--stroke)"
          strokeWidth="1.15"
        />

        {/* Cursor spotlight outline */}
        <use
          href={`#${ids.stroke}`}
          stroke={`url(#${ids.radialGradient})`}
          strokeWidth="1.15"
        />

        {/* Added outer lower edges */}
        <path
          d={OUTER_EDGE_D}
          fill="none"
          stroke="var(--outer-edge)"
          strokeWidth="1.15"
          strokeLinecap="butt"
          strokeLinejoin="miter"
        />
      </motion.g>
    </motion.svg>
  )
}