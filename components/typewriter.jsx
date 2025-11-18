"use client"
import { useEffect, useRef, useState } from "react"

export default function Typewriter({ text, speed = 45, className = "" }) {
  const [display, setDisplay] = useState("")
  const idxRef = useRef(0)

  useEffect(() => {
    setDisplay("")
    idxRef.current = 0
    const id = setInterval(() => {
      setDisplay((prev) => prev + text.charAt(idxRef.current))
      idxRef.current += 1
      if (idxRef.current >= text.length) clearInterval(id)
    }, speed)
    return () => clearInterval(id)
  }, [text, speed])

  return (
    <h1 className={className} aria-live="polite">
      {display}
    </h1>
  )
}
