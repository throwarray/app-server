import { useEffect, useMemo } from 'react'
import { Provider } from 'react-redux'
import { useStore } from '../components/store.js'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { createTheme, useDarkMode } from '../components/Layout/mui-theme'
import { ThemeProvider } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import dynamic from 'next/dynamic'

// Treat the default layout as a dynamic bundle so it doesn't end up bundled with all pages
const DefaultLayout = dynamic(() => import('../components/Layout/Layout'), { ssr: true })

export default function App ({ Component, pageProps, ...otherProps }) {
    const prefers_dark = useMediaQuery('(prefers-color-scheme: dark)')

    let [dark_mode] = useDarkMode()

    // Initialize store and theme
    const store = useStore(pageProps.initialReduxState)

    const theme = useMemo(() => createTheme({ 
        dark_mode,
        prefers_dark
    }), [dark_mode, prefers_dark])

    // Remove the server-side injected CSS.
    useEffect(() => {
        const jssStyles = document.querySelector('#jss-server-side')

        if (jssStyles) jssStyles.parentElement.removeChild(jssStyles)
    }, [])

    // Determine Layout component
    const Layout = typeof Component.Layout === 'function'? 
            Component.Layout:
            DefaultLayout

    // Provide the store and theme to pages
    return <Provider store={store}>
        <ThemeProvider theme={theme}>
        <CssBaseline />
        { Component.Layout === false?
            // Render page without layout
            <Component {...otherProps} {...pageProps}/>:
            // Render page with layout
            <Layout {...otherProps} store={store} Component={Component} pageProps={pageProps}/>
        }
        </ThemeProvider>
    </Provider>
}