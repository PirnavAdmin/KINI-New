import { useEffect, useRef, useState } from 'react'
import { RotateCcw, X } from 'lucide-react'

// Files in /public are served from the site root, so this must be a plaind
// absolute path rather than an import.
const INTRO_VIDEO_URL = '/videos/kiniedxintro.mp4'

// Set to false to hide the video.
// The video file and all existing video code remain in the project.
const SHOW_INTRO_VIDEO = false

const floatingControlClass =
  "flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"

// `variant="floating"` renders the same video asset as a small autoplaying
// corner card (used after Get In Touch closes/succeeds) instead of the
// original large centered modal, without touching the default modal path.
export default function VideoIntro({
  onSkip,
  onEnded,
  variant = 'modal',
}) {
  const videoRef = useRef(null)
  const [ended, setEnded] = useState(false)

  // Mounting with variant="floating" is itself the continuation of the Get
  // In Touch close/submit click, so this counts as the same user gesture
  // for the browser's unmuted-autoplay policy.
  useEffect(() => {
    if (!SHOW_INTRO_VIDEO) return
    if (variant !== 'floating') return

    const el = videoRef.current
    if (!el) return

    el.muted = false

    const playPromise = el.play()

    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.warn(
          'Video autoplay with sound was blocked by the browser:',
          error
        )
      })
    }
  }, [variant])

  const handleEnded = () => {
    setEnded(true)
    onEnded?.()
  }

  const handleReplay = () => {
    const el = videoRef.current
    if (!el) return

    el.currentTime = 0
    el.play()
    setEnded(false)
  }

  // ------------------------------------------------------------
  // VIDEO HIDDEN
  // ------------------------------------------------------------
  // The video file, component, callbacks, and existing implementation
  // are preserved. Only the visual rendering is disabled.
  if (!SHOW_INTRO_VIDEO) {
    return null
  }

  // ------------------------------------------------------------
  // FLOATING VIDEO
  // ------------------------------------------------------------
  if (variant === 'floating') {
    return (
      <div className="relative w-full overflow-hidden rounded-2xl border border-black/10 bg-black shadow-2xl dark:border-white/10">
        <video
          ref={videoRef}
          src={INTRO_VIDEO_URL}
          autoPlay
          playsInline
          onEnded={handleEnded}
          className="aspect-video w-full object-cover"
        />

        <button
          type="button"
          onClick={onSkip}
          aria-label="Close promotional video"
          className={`absolute right-2 top-2 ${floatingControlClass}`}
        >
          <X
            className="h-3.5 w-3.5"
            aria-hidden="true"
          />
        </button>

        {ended && (
          <button
            type="button"
            onClick={handleReplay}
            aria-label="Replay video"
            className={`absolute bottom-2 right-2 ${floatingControlClass}`}
          >
            <RotateCcw
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />
          </button>
        )}
      </div>
    )
  }

  // ------------------------------------------------------------
  // DEFAULT MODAL VIDEO
  // ------------------------------------------------------------
  return (
    <div className="relative w-full overflow-hidden rounded-2xl">
      <video
        src={INTRO_VIDEO_URL}
        autoPlay
        muted
        playsInline
        controls
        onEnded={onEnded}
        className="aspect-video w-full object-cover"
      />

      <button
        type="button"
        onClick={onSkip}
        className="absolute bottom-4 right-4 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg"
      >
        Skip Video
      </button>
    </div>
  )
}