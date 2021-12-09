import { Vec } from '@tldraw/vec'
import type { TLNuApp, TLNuBoxShape, TLNuBoxTool } from '~nu-lib'
import { TLNuToolState } from '~nu-lib'
import type { TLNuPointerHandler } from '~types'

export class PointingState<
  S extends TLNuBoxShape,
  R extends TLNuApp,
  P extends TLNuBoxTool<S, R>
> extends TLNuToolState<R, P> {
  static id = 'pointing'

  onPointerMove: TLNuPointerHandler = () => {
    const { currentPoint, originPoint } = this.app.inputs
    if (Vec.dist(currentPoint, originPoint) > 5) {
      this.tool.transition('creating')
      this.app.deselectAll()
    }
  }
}