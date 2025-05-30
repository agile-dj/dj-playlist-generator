"use client"

interface ClipLoaderProps {
  color?: string
  size?: number
  speedMultiplier?: number
}

export default function ClipLoader({ color = "#ffffff", size = 35, speedMultiplier = 1 }: ClipLoaderProps) {
  const style = {
    width: size,
    height: size,
    borderColor: `${color} transparent transparent transparent`,
    borderWidth: size / 5,
    animationDuration: `${0.75 / speedMultiplier}s`,
  }

  return (
    <div className="inline-block relative">
      <div style={style} className="absolute rounded-full border-solid animate-spin"></div>
      <div
        style={{
          ...style,
          animationDelay: `-${0.6 / speedMultiplier}s`,
          opacity: 0.8,
        }}
        className="absolute rounded-full border-solid animate-spin"
      ></div>
      <div
        style={{
          ...style,
          animationDelay: `-${0.4 / speedMultiplier}s`,
          opacity: 0.6,
        }}
        className="absolute rounded-full border-solid animate-spin"
      ></div>
      <div
        style={{
          ...style,
          animationDelay: `-${0.2 / speedMultiplier}s`,
          opacity: 0.4,
        }}
        className="absolute rounded-full border-solid animate-spin"
      ></div>
      <div style={{ width: size, height: size }}></div>
    </div>
  )
}
