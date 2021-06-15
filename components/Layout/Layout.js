import React, { useEffect } from 'react'
import Router, { withRouter } from 'next/router'
import { batch, connect } from 'react-redux'
import Head from 'next/head'
import useSWR from 'swr'
import { useToken } from '../xsrf.js'
import CssBaseline from '@material-ui/core/CssBaseline'
import CircularProgress from '@material-ui/core/CircularProgress'
import Fab from '@material-ui/core/Fab'
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import ConsecutiveSnackbars from './Snackbar.js'
import { login, logout } from '../slices/userSlice.js'

import CookiePolicy from './CookiePolicy'
import AsideLeft from './AsideLeft'
import ScrollTop from './ScrollTop'
import Footer from './Footer'
import Header from './Header'
import { ACTION_LOADING, ACTION_LOADING_PAGE } from '../store.js'
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
}))


const defaultProviders = [
    // {
    //     id: 'example',
    //     collections: ['example'],
    //     meta: ['example'],
    //     streams: ['example'],
    //     title: 'Example Provider',
    //     url: 'http://localhost:3000/api/providers/example'
    // }
]


const LayoutComponent = withRouter(connect(function ({ session, loading, loadingPage }) { 
    const { user, userUpdatedAt } = session

    return {
        loading: !!(loading && loading.length),
        loadingPage,
        user,
        userUpdatedAt,
        providers: [...defaultProviders, ...(user && user.providers || [])]
    } 
})(function ({ Component, pageProps, ...extraProps }) {
    const drawerWidth = 180 //240
    const classes = useLayoutStyles({ drawerWidth })
    const theme = useTheme()
    const [mobileOpen, setMobileOpen] = React.useState(false)
    const handleDrawerToggle = () => { setMobileOpen(!mobileOpen) }
    const isServer = typeof window === 'undefined'
    const { dispatch, loading, loadingPage, router  } = extraProps
    const parsingQuery = !isServer && !!window.location.search && !Object.keys(router.query).length
    const token = useToken()
    

    // useScrollTop('#main') // patch scroll to top behavior (note can't opt out)
    
    // Fetch user session
    useFetchSessionAndStoreUser(dispatch)
    
    // Dispatch loading page events
    useEffect(()=> DispatchLoadingPageStatus(dispatch), [dispatch])
    useEffect(function () { return function () { console.log('UNMOUNT LAYOUT COMPONENT') } }, [])
    
    console.log('RENDER LAYOUT FOR', Component.displayName || Component.name)

    return <div className={classes.root}>
        <Head>
            <meta name="viewport" key="viewport" content="width=device-width, initial-scale=1" />
            <title key="page-title">Loading... | App</title>
            <meta key="page-description" name="Description" content="Loading... | App"/>
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
            {/* Page is loading || Session is being fetched || Parsed query parameters weren't available yet */}
                { // !isServer && (loadingPage || loading || parsingQuery) && 
                
                // <Message style={{
                //     position: 'absolute',
                //     width: '100%',
                //     maxHeight: 'calc(100vh - 48px)'
                // }}><CircularProgress/></Message> 
                
                }

                <Component 
                    parsingQuery={parsingQuery} 
                    {...extraProps} 
                    {...pageProps}
                    />
            </div>

            <CookiePolicy/>
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
            
            batch(()=> {
                if (swr_error) dispatch(logout())
                
                else dispatch(login(swr_response))
                
                dispatch(ACTION_LOADING(false, { id: 'LOADING_USER_SESSION' }))
            })
        } else {
            console.log('fetch session')
            dispatch(ACTION_LOADING(true, { id: 'LOADING_USER_SESSION', iat: Date.now() })) 
        }
    }, [dispatch, swr_error, swr_response])
}

function DispatchLoadingPageStatus (dispatch) {
    const routeChangeStart = (url) => batch(()=> {
        console.log(`routeChangeStart: ${url}`)
        dispatch(ACTION_LOADING_PAGE(true))
        dispatch(ACTION_LOADING(true, { id: 'LOADING_PAGE', iat: Date.now() }))
    })

    const routeChangeError = (url) => batch(()=> {
        console.log(`routeChangeError: ${url}`)
        dispatch(ACTION_LOADING_PAGE(false))
        dispatch(ACTION_LOADING(false, { id: 'LOADING_PAGE' }))
    })
    
    const routeChangeComplete = (url) => batch(()=> {
        console.log(`routeChangeComplete: ${url}`)
        dispatch(ACTION_LOADING_PAGE(false))
        dispatch(ACTION_LOADING(false, { id: 'LOADING_PAGE' }))
    })

    Router.events.on('routeChangeError', routeChangeError)
    Router.events.on('routeChangeStart', routeChangeStart)
    Router.events.on('routeChangeComplete', routeChangeComplete)

    return function removeListeners () {
        Router.events.off('routeChangeError', routeChangeError)
        Router.events.off('routeChangeStart', routeChangeStart)
        Router.events.off('routeChangeComplete', routeChangeComplete)
    }
}

LayoutComponent.Layout = false

export default LayoutComponent








// user? <nav role="navigation">
// <div>{ user.nickname }</div>

// <img style={{ display: 'block' }} referrerPolicy="same-origin" src={user.picture} width="32" height="32" alt=""></img>
// {/* <Link key="nav-settings" href={'/settings'}>
//     <a className="nav-link" role="link" aria-label="Settings" title="Settings" style={{ display: 'block' }}>
//         Settings
//     </a>
// </Link> */}

// <form method="POST" action={'/api/logout?returnTo=' + encodeURIComponent(router.pathname)}>
//     <input name="_csrf" type="hidden" defaultValue={token}/>
//     <IconButton 
//         type="submit"
//         size="small"
//         title="Logout"
//         aria-label="Logout" 
//         component="button"
//     >   
//         <LogoutIcon/>
//     </IconButton>
// </form>
// </nav> : <nav role="navigation">
// <div aria-hidden="true"></div>
// <div aria-hidden="true" style={{ width: 32, height: 32 }}></div>
// <a href="/api/login" role="link" aria-label="Click to proceed to login" title="Login">Login</a>
// </nav>




