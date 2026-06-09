'use client'
import { useState } from 'react'
import Image, { ImageProps } from 'next/image'

interface Props extends Omit<ImageProps, 'onLoad' | 'style'> {
  style?: React.CSSProperties
}

export default function FadeInImage({ className, style, ...props }: Props) {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <Image
      {...props}
      className={className}
      style={{
        ...style,
        transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: isLoaded ? 1 : 0,
      }}
      onLoad={() => setIsLoaded(true)}
    />
  )
}
