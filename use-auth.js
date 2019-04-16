import React from 'react'
import jwt from 'jsonwebtoken'

export const States = {
  initializing: 'initializing',
  initialized: 'initialized',
  authenticating: 'authenticating',
  authenticated: 'authenticated',
  denied: 'denied',
  terminated: 'terminated'
}

const initialState = {
  status: States.initializing
}

const onInit = (state, action) => ({
  ...state,
  status: action.token ? States.initializing : States.initialized,
  token: action.token
})

const onAuthenticated = (state, action) => ({
  ...state,
  status: States.authenticated,
  id: action.id,
  username: action.username,
  token: action.token
})

const onDenied = (state, action) => ({
  ...state,
  status: States.denied,
  error: action.error,
  token: null
})

const reducer = (state, action) => {
  switch(action.type) {
    case 'init':
      return onInit(state, action)
    case 'setToken':
      return { ...state, token: action.token }
    case 'authenticating':
      return { ...state, state: States.authenticating }
    case 'authenticated':
      return onAuthenticated(state, action)
    case 'denied':
      return onDenied(state, action)
    case 'logout':
      return { status: States.terminated }
    default:
      return state
  }
}

const useLogin = ({ ds, username, password, token, dispatch }) => {
  // Check if there's a token stored from a previous session.
  React.useEffect(() => {
    const token = window.localStorage.getItem('nxt:token')
    dispatch({ type: 'init', token })
  }, [])

  // Store token whenever it changes.
  React.useEffect(() => {
    if (token) {
      window.localStorage.setItem('nxt:token', token)
    } else {
      window.localStorage.removeItem('nxt:token')
    }
  }, [token])

  // Login using username/password
  React.useEffect(() => {
    if (!ds || token || !username || !password) {
      return
    }

    dispatch({ type: 'authenticating' })

    ds.login({ type: 'basic', username, password }, (success, data) => {
      if (success) {
        dispatch({ type: 'authenticated', ...data })
      } else {
        const error = { type: 'credentials', message: data }
        dispatch({ type: 'denied', error })
      }
    })
  }, [ds, username, password, token])

  // Login using token.
  React.useEffect(() => {
    if (!ds || !token) {
      return
    }

    dispatch({ type: 'authenticating' })

    ds.login({ type: 'jwt', token }, (success, data) => {
      if (success) {
        dispatch({ type: 'authenticated', ...data })
      } else {
        const error = { type: 'token', message: data }
        dispatch({ type: 'denied', error })
      }
    })
  }, [ds, token])
}

const useAutoRefresh = ({ ds, token, dispatch }) => {
  React.useEffect(() => {
    // We only try to refresh the token if we're already authenticated.
    if (!ds || !token) {
      return
    }

    // Refresh every hour, unless the token expires before that.
    let refresh = Date.now() + 60 * 60 * 1000

    try {
      const { exp } = jwt.decode(token) || {}

      if (exp) {
        refresh = Math.min(refresh, exp * 1000 - 60 * 60 * 1000)
      }
    } catch (err) {
      console.warn(err)
      return
    }

    console.info(`refreshing jwt @ ${new Date(refresh)}`)

    const timeout = window.setTimeout(() => {
      ds.rpc.make('auth/refresh', { token }, (err, response) => {
        if (response && response.token) {
          dispatch({ type: 'setToken', token })
          console.info('jwt refresh succeeded')
        } else {
          dispatch({ type: 'logout' })
          console.warn('jwt refresh failed', err)
        }
      })
    }, refresh - Date.now())

    return () => {
      window.clearTimeout(timeout)
    }
  }, [ ds, token ])
}

export const useAuth = ({ ds, username, password }) => {
  const [ state, dispatch ] = React.useReducer(reducer, initialState)
  const { token } = state
  useLogin({ ds, dispatch, token, username, password })
  useAutoRefresh({ ds, dispatch, token })

  return [ state, dispatch ]
}
