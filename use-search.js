import React from "react"
import { Deepstream } from './provider'
import { useRecord } from './use-record'

export const useSearch = (opts) => {
  const { auth } = React.useContext(Deepstream)

  const options = JSON.stringify({
    type: opts.type || "simple",
    query: opts.query,
    user: opts.user || auth ? auth.id : null,
    count: opts.count || 1000,
  })

  return useRecord(`${options}:search`, 'hits')
}
