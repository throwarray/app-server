import React, { useEffect, useMemo } from 'react'
import { withRouter } from 'next/router'
import { connect } from 'react-redux'
import Head from 'next/head'
import useSWR from 'swr'
import { useToken } from '../xsrf.js'

import CircularProgress from '@material-ui/core/CircularProgress'
import Backdrop from '@material-ui/core/Backdrop'
import Fab from '@material-ui/core/Fab'
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import LinearProgress from '@material-ui/core/LinearProgress'

import { login, logout, setLoading } from '../slices/userSlice.js'
import usePageLoading from './usePageLoading.js'
import ConsecutiveSnackbars from './Snackbar.js'
import CookiePolicy from './CookiePolicy'
import AsideLeft from './AsideLeft'
import ScrollTop, { useScrollReset } from './ScrollTop'
import Footer from './Footer'
import Header from './Header'
import { fetch } from '../fetch'

const useLayoutStyles = makeStyles((theme) => ({
    root: { display: 'flex' },
    toolbar: theme.mixins.toolbar, // necessary for content to be below app bar
    main: {
        flexGrow: 1,
        //padding: theme.spacing(3),
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        width: ({ drawerWidth })=> `calc(100% - ${drawerWidth}px)`
    },
    content: {
        flex: 1,
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1
    }
}))

const DEFAULT_PROVIDERS = [
    // {
    //     id: 'example',
    //     collections: ['example'],
    //     meta: ['example'],
    //     streams: ['example'],
    //     title: 'Built-in Example Provider',
    //     url: 'http://localhost:3000/api/providers/example',
    //     system: true // TODO prevent being replaced by a custom provider
    //     // TODO prevent editing and removal
    // }
]

const LayoutComponent = withRouter(connect(function ({ session }) { 
    const { 
        user,
        userUpdatedAt,
        loading
    } = session

    return {
        user,
        userUpdatedAt,
        loading,  
    } 
})(function ({ Component, pageProps, ...extraProps }) {
    const drawerWidth = 180 //240
    const classes = useLayoutStyles({ drawerWidth })
    const theme = useTheme()
    const [mobileOpen, setMobileOpen] = React.useState(false)
    const handleDrawerToggle = () => { setMobileOpen(!mobileOpen) }

    const isServer = typeof window === 'undefined'
    const { dispatch, loading, router  } = extraProps
    const providers = useMergedProviders(extraProps.user && extraProps.user.providers)
    const parsingQuery = !isServer && !!window.location.search && !Object.keys(router.query).length
    const token = useToken()

    // Reset the scroll to the top of the page when navigating
    useScrollReset()

    // Fetch user session
    useFetchSessionAndStoreUser(dispatch)
    
    // Dispatch loading page events
    const [, loading_page] = usePageLoading()

    useEffect(function () { return function () { console.log('UNMOUNT LAYOUT COMPONENT') } }, [])

    // console.log('RENDER LAYOUT FOR', Component.displayName || Component.name)


    return <div className={classes.root}>
        <Head>
            <meta name="viewport" key="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
            <title key="page-title">App</title>
            <meta key="page-description" name="Description" content="App"/>
            <link rel="preconnect" href="https://tmdb.org"></link>
            <link rel="preconnect" href="https://image.tmdb.org"></link>
        </Head>
        <ConsecutiveSnackbars/>
        <Header router={router} user={extraProps.user} token={token} drawerWidth={drawerWidth} handleDrawerToggle={handleDrawerToggle}/>
        <AsideLeft router={router} user={extraProps.user} token={token} drawerWidth={drawerWidth} handleDrawerToggle={handleDrawerToggle} theme={theme} mobileOpen={mobileOpen}/>
        <main className={classes.main}>
            <div id="back-to-top-anchor"/>

            <div className={classes.toolbar} />

            <div className={classes.content}>
                { loading_page && <LinearProgress /> || null } 
                <Backdrop className={classes.backdrop} open={!isServer && (loading || parsingQuery)}>
                    <CircularProgress/>
                </Backdrop>
                <Component 
                    parsingQuery={parsingQuery} 
                    {...extraProps} 
                    providers={providers}
                    {...pageProps}
                />
            </div>
            
            { extraProps.user? null : <CookiePolicy/> }
            <Footer/>
            <ScrollTop selector="#back-to-top-anchor">
                <Fab color="default" size="small" aria-label="scroll back to top">
                    <KeyboardArrowUpIcon />
                </Fab>
            </ScrollTop>
        </main>
    </div>
}))

// Fetch user session
function useFetchSession (props) {
    return useSWR('/api/user', async function () {
        const response = await fetch('/api/user', { /*credentials: 'include'*/ })
        const isUnauthenticated = response.status >= 400 || response.status < 200
        
        if (isUnauthenticated) throw new Error('Unauthenticated')
        
        const user = await response.json()

        return user
    }, {
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        shouldRetryOnError: false,
        ...props
    }) 
}

function useFetchSessionAndStoreUser (dispatch, _swr_props) {
    const { data: swr_response, error: swr_error } = useFetchSession(_swr_props)  

    useEffect(function () {
        if (swr_error || swr_response) {
            console.log('update session', swr_error && 'Unauthenticated' || swr_response)

            if (swr_error) dispatch(logout())
            
            else dispatch(login(swr_response))

            dispatch(setLoading(false))
        } else {
            console.log('fetch session')

            dispatch(setLoading(false))
        }
    }, [dispatch, swr_error, swr_response])
}

// Merge user providers with the default providers
// Deduplicate providers by id
function useMergedProviders (_providers, defaults = DEFAULT_PROVIDERS) {
    return useMemo(function () {    
        const providers = new Map()

        defaults.forEach((provider)=> providers.set(provider.id, provider))
    
        if (_providers) _providers.forEach(function (provider) {
            //// Prevent replacing system providers

            const existing = providers.get(provider.id)

            if (existing && existing.system) {
                // console.warn('Failed to replace built-in provider', existing.id)
                return
            }
    
            providers.set(provider.id, provider)
        })

        return [...providers.values()].sort((a, b)=> a.id > b.id ? 1 : -1)
    }, [_providers, defaults])
}

LayoutComponent.Layout = false

export default LayoutComponent