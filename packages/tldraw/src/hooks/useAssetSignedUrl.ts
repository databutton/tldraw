import useSWR from 'swr'
import { TDAssetWithData } from '~types'
import { useTldrawApp } from './useTldrawApp'

export function useAssetSignedUrl(asset: TDAssetWithData) {
  const app = useTldrawApp()
  const { data, error } = useSWR(
    asset.storageKey && asset.storageKey.length > 0 ? asset : undefined,
    app.callbacks.fetchDataForAsset!,
    {
      refreshInterval: 0,
    }
  )
  return { data: data?.signedUrl, error }
}
