import React from 'react'

export const useObservable = (observable, initialValue) => {
  const [data, setData] = React.useState(initialValue)

  React.useEffect(() => {
    const subscription = observable.subscribe(setData)
    return () => {
      subscription.unsubscribe()
    }
  }, [observable])

  return data
}
