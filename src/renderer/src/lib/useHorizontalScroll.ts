import { useRef, useEffect } from 'react'

interface Props {
  type?: 'scroll' | 'hidden'
  gap?: number
}

const useHorizontalScroll = (_props?: Props) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) {
      return
    }

    const element = <HTMLElement>ref.current.querySelector('[data-radix-scroll-area-viewport]')

    if (!element) {
      return
    }

    const handleWheel = (event: WheelEvent) => {
      // Only handle scroll if there's horizontal scrolling available
      if (element.scrollWidth > element.clientWidth) {
        // Check if there's horizontal scroll delta (Mac trackpad)
        if (Math.abs(event.deltaX) > 0) {
          event.preventDefault()
          element.scrollLeft += event.deltaX
        }
        // Or vertical scroll delta (Windows mouse wheel)
        else if (Math.abs(event.deltaY) > 0) {
          event.preventDefault()
          element.scrollLeft += event.deltaY
        }
      }
    }

    element.addEventListener('wheel', handleWheel)

    return () => {
      element.removeEventListener('wheel', handleWheel)
    }
  }, [ref])

  return { ref }
}

export default useHorizontalScroll
