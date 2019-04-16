import React from "react"
import { Deepstream } from "./provider"

const hash = (ids) => {
  return ids ? ids.join('') : ''
}

export const useRecords = ids => {
  const { ds, auth } = React.useContext(Deepstream)
  const [values, setValues] = React.useState([])

  React.useEffect(() => {
    if (!ds || !auth) {
      return
    }

    const subscriptions = ids.map((id, idx) =>
      ds.record.observe(id).subscribe(data => {
        setValues(values => {
          const tmp = [...values]
          tmp[idx] = data
          return tmp
        })
      })
    )

    return () => {
      subscriptions.map(subscription => subscription.unsubscribe())
    }
  }, [ds, auth, hash(ids)])

  return values
}
