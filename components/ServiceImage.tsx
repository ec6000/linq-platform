"use client"

import Image from "next/image"
import { ImageIcon } from "lucide-react"

interface ServiceImageProps {
  src?: string
  sizes: string
  iconSize?: number
  priority?: boolean
  className?: string
}

/**
 * A provider's picture with the placeholder icon underneath it. A missing or
 * broken URL simply leaves the icon showing, so there is only one code path.
 */
export default function ServiceImage({ src, sizes, iconSize = 26, priority, className = "" }: ServiceImageProps) {
  return (
    <div className={`relative flex items-center justify-center overflow-hidden bg-muted text-text/20 ${className}`}>
      <ImageIcon size={iconSize} strokeWidth={1.5} aria-hidden />
      {src && (
        <Image
          src={src}
          alt=""
          fill
          unoptimized
          priority={priority}
          sizes={sizes}
          onError={(event) => (event.currentTarget.hidden = true)}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
      )}
    </div>
  )
}
