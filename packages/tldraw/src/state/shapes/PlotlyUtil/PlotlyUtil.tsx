import { styled } from '@stitches/react'
import { HTMLContainer, Utils } from '@tldraw/core'
// import Plotly from 'plotly.js-dist-min'
import * as React from 'react'
import useSWR from 'swr'
import DraggerButton from '~components/DraggerButton/DraggerButton'
import { GHOSTED_OPACITY } from '~constants'
import { useTldrawApp } from '~hooks'
import { useAssetSignedUrl } from '~hooks/useAssetSignedUrl'
import {
  defaultStyle,
  getBoundsRectangle,
  transformRectangle,
  transformSingleRectangle,
} from '~state/shapes/shared'
import { PlotlyShape, TDMeta, TDPlotlyAsset, TDShapeType } from '~types'
import { TDShapeUtil } from '../TDShapeUtil'
import type PlotlyType from 'plotly.js-dist-min'

type T = PlotlyShape
type E = HTMLDivElement

export class PlotlyUtil extends TDShapeUtil<T, E> {
  type = TDShapeType.Plotly as const

  canBind = true

  canClone = false

  isAspectRatioLocked = false

  showCloneHandles = true

  dataFetcher = async (signedUrl: string) => {
    const dataResponse = await fetch(signedUrl)
    const data = await dataResponse.json()
    return data
  }

  getShape = (props: Partial<T>): T => {
    return Utils.deepMerge<T>(
      {
        id: 'plotly',
        type: TDShapeType.Plotly,
        name: 'Plotly',
        parentId: 'page',
        childIndex: 1,
        point: [0, 0],
        size: [1, 1],
        rotation: 0,
        style: { ...defaultStyle, isFilled: true },
        assetId: 'assetId',
      },
      props
    )
  }

  Component = TDShapeUtil.Component<T, E, TDMeta>(
    (
      {
        shape,
        asset = { storageKey: '' } as TDPlotlyAsset,
        isBinding,
        isGhost,
        meta,
        events,
        onShapeChange,
      },
      ref
    ) => {
      const { size, style } = shape

      const rWrapper = React.useRef<HTMLDivElement>(null)
      const rPlot = React.useRef<HTMLDivElement>(null)
      const rPlotly = React.useRef<Plotly.PlotlyHTMLElement>()

      const { data: signedUrl, error: signedUrlError } = useAssetSignedUrl(asset as TDPlotlyAsset)
      const { data, error } = useSWR(signedUrl, this.dataFetcher, { refreshInterval: 0 })
      const app = useTldrawApp()

      const [initialized, setInitialized] = React.useState<boolean>(false)
      const activeTool = app.useStore((s) => s.appState.activeTool)

      const layout = React.useMemo(() => {
        if (size && data && initialized) {
          return {
            ...data.layout,
            width: size[0],
            height: size[1],
          }
        }
      }, [size, data, rPlot, initialized])

      const interactive = React.useMemo(() => activeTool === 'select', [activeTool])

      const Plotly: typeof PlotlyType = React.useMemo(() => {
        if (typeof window !== 'undefined') {
          return require('plotly.js-dist-min')
        }
        return undefined
      }, [window])

      React.useLayoutEffect(() => {
        if (rPlot.current && layout) {
          Plotly.react(rPlot.current, data.data, layout, {
            staticPlot: !interactive,
            displayModeBar: false,
          })
        }
      }, [layout, rPlot, interactive])

      React.useLayoutEffect(() => {
        const wrapper = rWrapper.current
        if (!wrapper) return
        const [width, height] = size
        wrapper.style.width = `${width}px`
        wrapper.style.height = `${height}px`
      }, [size])

      React.useEffect(() => {
        if (data && !error) {
          if (rPlot.current) {
            setInitialized(false)
            Plotly.newPlot(
              rPlot.current,
              data.data,
              {
                ...data.layout,
              },
              { editable: false, staticPlot: true, displayModeBar: false }
            ).then((plot) => {
              rPlotly.current = plot
              setInitialized(true)
            })
            return () => {}
          }
          return
        }
        return
      }, [data, error, rPlot])

      return (
        <HTMLContainer ref={ref}>
          <DraggerButton
            events={{ onPointerDown: events.onPointerDown, onPointerUp: events.onPointerUp }}
          />
          {isBinding && (
            <div
              className="tl-binding-indicator"
              style={{
                position: 'absolute',
                top: `calc(${-this.bindingDistance}px * var(--tl-zoom))`,
                left: `calc(${-this.bindingDistance}px * var(--tl-zoom))`,
                width: `calc(100% + ${this.bindingDistance * 2}px * var(--tl-zoom))`,
                height: `calc(100% + ${this.bindingDistance * 2}px * var(--tl-zoom))`,
                backgroundColor: 'var(--tl-selectFill)',
              }}
            />
          )}
          <Wrapper
            ref={rWrapper}
            isDarkMode={meta.isDarkMode} //
            isFilled={style.isFilled}
            isGhost={isGhost}
          >
            <StyledPlot ref={rPlot} />
          </Wrapper>
        </HTMLContainer>
      )
    }
  )

  Indicator = TDShapeUtil.Indicator<T>(({ shape }) => {
    const {
      size: [width, height],
    } = shape

    return (
      <rect x={0} y={0} rx={2} ry={2} width={Math.max(1, width)} height={Math.max(1, height)} />
    )
  })

  getBounds = (shape: T) => {
    return getBoundsRectangle(shape, this.boundsCache)
  }

  shouldRender = (prev: T, next: T) => {
    return next.size !== prev.size || next.style !== prev.style
  }

  transform = transformRectangle

  transformSingle = transformSingleRectangle
}

const Wrapper = styled('div', {
  pointerEvents: 'all',
  position: 'relative',
  fontFamily: 'sans-serif',
  fontSize: '2em',
  height: '100%',
  width: '100%',
  borderRadius: '3px',
  perspective: '800px',
  overflow: 'hidden',
  p: {
    userSelect: 'none',
  },
  img: {
    userSelect: 'none',
  },
  variants: {
    isGhost: {
      false: { opacity: 1 },
      true: { transition: 'opacity .2s', opacity: GHOSTED_OPACITY },
    },
    isFilled: {
      true: {},
      false: {},
    },
    isDarkMode: {
      true: {},
      false: {},
    },
  },
  compoundVariants: [
    {
      isFilled: true,
      isDarkMode: true,
      css: {
        boxShadow:
          '2px 3px 12px -2px rgba(0,0,0,.3), 1px 1px 4px rgba(0,0,0,.3), 1px 1px 2px rgba(0,0,0,.3)',
      },
    },
    {
      isFilled: true,
      isDarkMode: false,
      css: {
        boxShadow:
          '2px 3px 12px -2px rgba(0,0,0,.2), 1px 1px 4px rgba(0,0,0,.16),  1px 1px 2px rgba(0,0,0,.16)',
      },
    },
  ],
})

const StyledPlot = styled('div', {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  maxWidth: '100%',
  minWidth: '100%',
})
