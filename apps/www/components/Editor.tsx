import { TDAssetWithData, Tldraw, TldrawApp, TldrawProps, useFileSystem } from '@tldraw/tldraw'
import { useAccountHandlers } from 'hooks/useAccountHandlers'
import React from 'react'
import { exportToImage } from 'utils/export'
import * as gtag from 'utils/gtag'

declare const window: Window & { app: TldrawApp }

interface EditorProps {
  id?: string
  isUser?: boolean
  isSponsor?: boolean
}

const fetchDataForAsset = async (asset: TDAssetWithData) => {
  const url = 'http://localhost:3000/api/get-url'
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({ storageKey: asset.storageKey }),
  })
  const json = await res.json()
  const { signedUrl } = json as { signedUrl: string }
  return { signedUrl }
}

export default function Editor({
  id = 'home',
  isUser = false,
  isSponsor = false,
  ...rest
}: EditorProps & Partial<TldrawProps>) {
  const handleMount = React.useCallback((app: TldrawApp) => {
    window.app = app
  }, [])

  // Send events to gtag as actions.
  const handlePersist = React.useCallback((_app: TldrawApp, reason?: string) => {
    gtag.event({
      action: reason ?? '',
      category: 'editor',
      label: reason ?? 'persist',
      value: 0,
    })
  }, [])

  const fileSystemEvents = useFileSystem()

  const { onSignIn, onSignOut } = useAccountHandlers()

  return (
    <div className="tldraw">
      <Tldraw
        id={id}
        autofocus
        onMount={handleMount}
        onPersist={handlePersist}
        showSponsorLink={!isSponsor}
        onSignIn={isSponsor ? undefined : onSignIn}
        onSignOut={isUser ? onSignOut : undefined}
        onExport={exportToImage}
        fetchDataForAsset={fetchDataForAsset}
        {...fileSystemEvents}
        {...rest}
      />
    </div>
  )
}
