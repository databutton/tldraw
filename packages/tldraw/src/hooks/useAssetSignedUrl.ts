import * as React from 'react'
import useSWR from 'swr'
import type { TldrawApp } from '~state'
import { TDAssetWithData } from '~types'
import { useTldrawApp } from './useTldrawApp'

export const TldrawContext = React.createContext<TldrawApp>({} as TldrawApp)

export function useAssetSignedUrl(asset: TDAssetWithData) {
  const app = useTldrawApp()

  const { data, error } = useSWR(
    asset.storageKey ? asset.storageKey : undefined,
    app.callbacks.fetchDataForAsset!,
    {
      refreshInterval: 0,
    }
  )
  return { data: data?.signedUrl, error }
}
