import * as React from 'react'
import useSWR from 'swr'
import type { TldrawApp } from '~state'
import { TDAsset, TDAssetWithData, TDPlotlyAsset } from '~types'
import { useTldrawApp } from './useTldrawApp'

export const TldrawContext = React.createContext<TldrawApp>({} as TldrawApp)

const urlFetcher = async (url: string, storageKey: string) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({ storageKey }),
  })
  const json = await res.json()
  return {
    signedUrl: json.signedUrl,
  }
}

export function useAssetSignedUrl(asset: TDAssetWithData) {
  const app = useTldrawApp()
  if (app.callbacks.fetchDataForAsset) {
  }
  const { data, error } = useSWR(asset.storageKey, app.callbacks.fetchDataForAsset!, {
    refreshInterval: 0,
  })
  return { data: data?.signedUrl, error }
}
