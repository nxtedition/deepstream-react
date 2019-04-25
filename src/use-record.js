import React from "react"
import { Deepstream } from './provider'

export const useRecord = (id, path) => {
  const { ds, auth } = React.useContext(Deepstream)
  const [data, setData] = React.useState(null)

  React.useEffect(() => {
    if (!ds || !auth) {
      return
    }

    const subscription = ds.record.observe(id)
      .subscribe(data => {
        if (path) {
          setData(data[path])
        } else {
          setData(data)
        }
      })

    return () => {
      subscription.unsubscribe()
    }
  }, [ds, auth, id, path])

  return data
}
