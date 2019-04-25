import React from 'react'
import deepstreamClient from '@nxtedition/deepstream.io-client-js'
import { useAuth } from './use-auth'

const Deepstream = React.createContext()

let ds = null

const DeepstreamProvider = ({ url, username, password, children }) => {
  React.useEffect(() => {
    ds = deepstreamClient(url)
    return () => {
      console.warn('Deepstream does not support changing url')
    }
  }, [url])

  const [auth, dispatch] = useAuth({ ds, username, password })
  const value = { auth, dispatch, ds }

  return (
    <Deepstream.Provider value={value}>
      {children(value)}
    </Deepstream.Provider>
  )
}

export { Deepstream, DeepstreamProvider }
