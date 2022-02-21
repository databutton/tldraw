import { styled } from '@stitches/react'
import { HTMLContainer, Utils } from '@tldraw/core'
import { AgGridReact } from 'ag-grid-react'
import React from 'react'
// import Plotly from 'plotly.js-dist-min'
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
import { AgGridShape, TDMeta, TDPlotlyAsset, TDShapeType } from '~types'
import { TDShapeUtil } from '../TDShapeUtil'

type T = AgGridShape
type E = HTMLDivElement

export class AgGridUtil extends TDShapeUtil<T, E> {
  type = TDShapeType.AgGrid as const

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
        id: 'aggrid',
        type: TDShapeType.AgGrid,
        name: 'AgGrid',
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
      { shape, asset = {} as TDPlotlyAsset, isBinding, isGhost, meta, events, onShapeChange },
      ref
    ) => {
      const { size, style } = shape

      const rWrapper = React.useRef<HTMLDivElement>(null)
      const { data: signedUrl, error: signedUrlError } = useAssetSignedUrl(asset as TDPlotlyAsset)
      const { data, error } = useSWR(signedUrl, this.dataFetcher, {
        refreshInterval: 0,
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
      })
      const app = useTldrawApp()

      const activeTool = app.useStore((s) => s.appState.activeTool)

      // @todo: fix interaction model
      const interactive = React.useMemo(() => activeTool === 'select', [activeTool])

      React.useLayoutEffect(() => {
        const wrapper = rWrapper.current
        if (!wrapper) return
        const [width, height] = size
        wrapper.style.width = `${width}px`
        wrapper.style.height = `${height}px`
      }, [size])

      const { rowData = [], columnDefs = [] } = React.useMemo(() => {
        if (!data) {
          return {}
        }
        // Make sure data has the right shape
        if (!Array.isArray(data)) {
          return {}
        }
        // this isn't really random, hihi
        const randomSample = data[0] || {}
        const columnDefs = Object.keys(randomSample).map((key) => ({
          field: key,
        }))
        return {
          rowData: data,
          columnDefs: columnDefs,
        }
      }, [data])

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
            isDarkMode={meta.isDarkMode}
            isFilled={style.isFilled}
            isGhost={isGhost}
          >
            <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
              <AgGridReact rowData={rowData} columnDefs={columnDefs}></AgGridReact>
            </div>
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
