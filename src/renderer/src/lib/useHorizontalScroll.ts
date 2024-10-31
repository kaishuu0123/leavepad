import { useRef, useEffect } from 'react'

interface Props {
  type?: 'scroll' | 'hidden'
  gap?: number
}

const useHorizontalScroll = (_props?: Props) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      const element = <HTMLElement>ref.current.querySelector('[data-radix-scroll-area-viewport]')
      element?.addEventListener('wheel', (event: WheelEvent) => {
        event.preventDefault()

        if (element) {
          element.scrollLeft += event.deltaY
        }
      })
    }
  }, [ref])

  return { ref }
}

export default useHorizontalScroll
