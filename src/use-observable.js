import React from "react"

export const useObservable = (observable, initialValue) => {
  const [data, setData] = React.useState(initialValue)

  React.useEffect(() => {
    const subscription = observable.subscribe(data => {
      setData(data)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [observable])

  return data
}
