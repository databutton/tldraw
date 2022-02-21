import React from 'react'
import { MoveIcon } from '~components/Primitives/icons/MoveIcon'

type DraggerButtonProps = {
  events: {
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void
    onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void
  }
}

const DRAGGER_SIZE = 18

const DraggerButton: React.FC<DraggerButtonProps> = ({ events }) => {
  return (
    <div
      {...events}
      style={{
        pointerEvents: 'all',
        width: `calc(${DRAGGER_SIZE}px / var(--tl-zoom))`,
        height: `calc(${DRAGGER_SIZE}px / var(--tl-zoom))`,
        top: `calc(${-DRAGGER_SIZE}px / var(--tl-zoom) - 4px)`,
        left: `calc(${-DRAGGER_SIZE}px / var(--tl-zoom) - 4px)`,
        cursor: 'move',
        position: 'absolute',
      }}
    >
      <MoveIcon />
    </div>
  )
}

export default DraggerButton
