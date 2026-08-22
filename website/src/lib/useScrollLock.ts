'use client'

import { useEffect } from 'react'

let lockCount = 0

export function lockScroll() {
  if (typeof document === 'undefined') return
  lockCount++
  if (lockCount === 1) {
    document.documentElement.classList.add('scroll-locked')
    document.body.classList.add('scroll-locked')
  }
}

export function unlockScroll() {
  if (typeof document === 'undefined') return
  lockCount = Math.max(0, lockCount - 1)
  if (lockCount === 0) {
    document.documentElement.classList.remove('scroll-locked')
    document.body.classList.remove('scroll-locked')
  }
}

export function useScrollLock(isLocked: boolean = true) {
  useEffect(() => {
    if (!isLocked) return
    lockScroll()
    return () => {
      unlockScroll()
    }
  }, [isLocked])
}
