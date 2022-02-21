import useSWR from 'swr'
import { TDAssetWithData } from '~types'
import { useTldrawApp } from './useTldrawApp'

export function useAssetSignedUrl(asset: TDAssetWithData) {
  const app = useTldrawApp()
  const { data, error } = useSWR(asset ? asset : undefined, app.callbacks.fetchDataForAsset!, {
    refreshInterval: 0,
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })
  return { data: data?.signedUrl, error }
}
