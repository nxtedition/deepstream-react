import React from 'react'
import { Deepstream } from './provider'
import { Observable } from 'rxjs'

export const useRecord = (ids, path, state, debounce) => {
  let initialValue = null
  if (Array.isArray(ids)) {
    initialValue = []
  } else if (!path) {
    initialValue = {}
  }

  const { ds, auth } = React.useContext(Deepstream)
  const [values, setValues] = React.useState(initialValue)

  ids = auth && ds && ids && ids.length > 0 ? ids : null

  React.useEffect(() => {
    if (!ids) {
      setValues(initialValue)
    } else {
      const observe = id => ds.record
        .observe(id, state)
        .publish(x$ => path ? x$.pluck(...path.split('.')).distinctUntilChanged() : x$)

      const observable = Array.isArray(ids)
        ? Observable.combineLatest(ids.map(observe))
        : observe(ids)

      const subscription = observable
        .publish(x$ => typeof debounce === 'number' ? x$.debounceTime(debounce) : x$)
        .subscribe(setValues)

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [ds, path, state, debounce].concat(ids))

  return values
}
