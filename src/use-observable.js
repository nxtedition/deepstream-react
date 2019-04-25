import React from 'react'

export const useObservable = (args, factory, initialValue) => {
  const [data, setData] = React.useState(initialValue)

  React.useEffect(() => {
    const subscription = factory(...args).subscribe(setData)
    return () => {
      subscription.unsubscribe()
    }
  }, [factory].concat(args))

  return data
}
