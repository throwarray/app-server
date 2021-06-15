import { createMuiTheme } from '@material-ui/core/styles'
import { useEffect, useState } from 'react'

// import { red } from '@material-ui/core/colors';

function createUseLocalStorage (keyname, initial_value) {
  const subscriptions = new Map()
  
  let value = initial_value

  function updateValue (val) {
    if (!window.localStorage) return
    localStorage.setItem(keyname, val)
    value = val // perf: not accessed from localStorage by each subscriber
    subscriptions.forEach(function (rerender) { rerender(Date.now()) })
  }

  function clearValue () {
    if (!window.localStorage) return
    localStorage.removeItem(keyname)
    value = void 0
    subscriptions.forEach(function (rerender) { rerender(Date.now()) })
    subscriptions.clear()
  }

  return function useValue () {
    const [, setState] = useState()
      
    useEffect(()=> {
      const subscription = {}

      let previous

      subscriptions.set(subscription, setState)

      if (subscriptions.size === 1 && (previous = localStorage.getItem(keyname)) !== null) 
        updateValue(previous) // rehydrate

      return ()=> subscriptions.delete(subscription)
    }, [])

    return [value, updateValue, clearValue]
  }
}

// The default theme name to use for SSR and the initial render.
export const DEFAULT_DARK_MODE = 'dark'

// It stores the theme name in localStorage.
// NOTE could've used redux and localStorage but this has no dependencies.
export const useDarkMode = createUseLocalStorage('dark_mode', DEFAULT_DARK_MODE)

// TODO
// export function useDarkMode () {
//   const [val, setDarkMode, deleteDarkMode] = useLocalStorage()

//   const prefers_dark = useMediaQuery('(prefers-color-scheme: dark)')

//   let dark

//   if (val === 'auto') dark = prefers_dark

//   else dark = val === 'dark'

//   return {
//     setDarkMode,
//     deleteDarkMode,
//     prefers_dark,
//     auto: val === 'auto',
//     dark
//   }
// }


// It creates a theme instance.
export function createTheme ({ dark_mode = DEFAULT_DARK_MODE, prefers_dark }) {
  if (dark_mode === 'auto')
      dark_mode = prefers_dark? 'dark': 'light'

  return createMuiTheme({    
    palette: {
      // primary: {
      //   main: '#556cd6',
      // },
      // secondary: {
      //   main: '#19857b',
      // },
      // error: {
      //   main: red.A400,
      // },
      // background: {
      //   default: '#fff',
      // },

      type: dark_mode === 'dark' ? 
        'dark' : 
        'light'
    }
  })
}

