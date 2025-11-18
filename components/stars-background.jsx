"use client"
import { useEffect, useRef } from "react"

export default function StarsBackground({ density = 120, className = "" }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d", { alpha: true })
    let rafId
    let stars = []
    const DPR = Math.max(1, window.devicePixelRatio || 1)

    const resize = () => {
      canvas.width = canvas.clientWidth * DPR
      canvas.height = canvas.clientHeight * DPR
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
      spawn()
    }

    const spawn = () => {
      stars = Array.from({ length: density }).map(() => ({
        x: Math.random() * canvas.clientWidth,
        y: Math.random() * canvas.clientHeight,
        r: Math.random() * 1.5 + 0.3,
        a: Math.random(),
        v: Math.random() * 0.03 + 0.01,
      }))
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)
      for (const s of stars) {
        s.a += s.v
        const alpha = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(s.a))
        ctx.fillStyle = `rgba(255,255,255,${alpha})`
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }
      rafId = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener("resize", resize)
    draw()
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener("resize", resize)
    }
  }, [density])

  return <canvas ref={canvasRef} className={className} aria-hidden />
}
