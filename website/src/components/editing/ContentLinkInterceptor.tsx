'use client'

import React, { useEffect, useRef } from 'react'
import { useEditMode } from './EditContext'

export default function ContentLinkInterceptor({ children }: { children: React.ReactNode }) {
  const { isEditMode } = useEditMode()
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isEditMode || !containerRef.current) return

    const container = containerRef.current

    function handleClickCapture(e: MouseEvent) {
      if (!isEditMode) return

      const target = e.target as HTMLElement | null
      if (!target) return

      // Don't intercept if clicked inside an editable text or image action or modal dialog
      if (
        target.closest('.editable-live-text') ||
        target.closest('button[title*="uploaden"]') ||
        target.closest('button[title*="wijzigen"]') ||
        target.closest('[role="dialog"]')
      ) {
        return
      }

      // If click was on or inside an <a> tag
      const link = target.closest('a')
      if (link) {
        // Prevent default navigation
        e.preventDefault()
        e.stopPropagation()
      }
    }

    container.addEventListener('click', handleClickCapture, true)
    return () => {
      container.removeEventListener('click', handleClickCapture, true)
    }
  }, [isEditMode])

  return (
    <div ref={containerRef} className="public-layout-content">
      {children}
    </div>
  )
}
