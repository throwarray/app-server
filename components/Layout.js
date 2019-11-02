import Link from 'next/link'
import Router, { withRouter } from 'next/router'

// import Head from 'next/head'

import { connect } from 'react-redux'
import { fetch } from './fetch'
import ReactDOMServer from 'react-dom/server'
import { useEffect } from 'react'
import { trigger } from 'swr'

function logout () {
    function handleLogout () { trigger('/user') }

    return Promise.resolve(fetch('/logout').then(handleLogout, handleLogout))
}

const Aside = function (/*{ providers }*/) {
    return <aside className="aside" role="complementary">
        <style jsx>{`
            .aside {
                // width: 50px;
                max-width: 120px;
                flex-shrink: 0;
                max-height: 100vh;
                min-height: 100vh;
                overflow: auto;
                display: flex;
                flex-direction: column;
                background: #222;
            }
            
            .aside-items {
                flex:1;
                overflow:auto;
                margin: 0;
                padding: 0.5em;
            }

            .nav-link {
                background: #333;
                margin-bottom: 0.5em;
                padding: 1em;
                text-align:center;
                line-height: 2em;
                text-overflow: ellipsis;
                text-decoration: none;
                overflow: hidden;
                white-space: nowrap;
                color: #fff;
                background-color: #333;
                border: 1px solid orange;
                border-radius: 4px;
                padding: 0 15px;
                cursor: pointer;
                height:32px;
                font-size:14px;
                transition: all 0.2s ease-in-out;

                width: 4em;
            }
            
            .nav-link:hover {
                transform: scale(1.1);
            }

            .nav-home {
                text-decoration: none;
                display: block;
                text-align: center;
                margin: 0 0.5em;
                background: #111;
                border-radius: 3px;
                border: 1px solid darkorange;
            }
            `}
        </style>

        <div style={{ padding: '0.5em 0', background: '#111' }}>
            <div>
                <Link key="nav-home" href={'/'}>
                    <a className="nav-home nav-link" role="link" aria-label="Click to go to home page" title="Home" tabIndex={0}>🍉</a>
                </Link>
            </div>
        </div>
        
        <div className="aside-items">
            <Link key="nav-about" href={'/about'}>
                <a tabIndex="0" className="nav-link material-icons" role="link" aria-label="About" title="About" style={{ display: 'block' }}>
                    info
                </a>
            </Link>

            {/* <Link key="nav-storage" href={'/storage'}>
                <a className="nav-link" role="link" aria-label="Storage" title="Storage" style={{ display: 'block' }}>
                    Storage
                </a>
            </Link> */}

            <Link key="nav-settings" href={'/settings'}>
                <a tabIndex="0" className="nav-link material-icons" role="link" aria-label="Settings" title="Settings" style={{ display: 'block' }}>
                    settings
                </a>
            </Link>
        </div>
    </aside>
}

const Header = function Header ({ user, logout }) {
    return <header role="banner">
        <style jsx>{`
            header {
                color: #eee;
                display: flex;
                align-items: center;
                box-sizing: border-box;
                background: #222;
            }
            
            nav {
                display: flex;
                align-items: center;
            }

            nav > * {
                margin: 0.5em;
            }
        `}
        </style>

        <div aria-hidden="true" className="spacer" style={{ flex: 1 }}></div>

        {
            user? <nav role="navigation">
                <div>{ user.nickname }</div>

                <img style={{ display: 'block' }} referrerPolicy="same-origin" src={user.picture} width="32" height="32" alt=""></img>
                {/* <Link key="nav-settings" href={'/settings'}>
                    <a className="nav-link" role="link" aria-label="Settings" title="Settings" style={{ display: 'block' }}>
                        Settings
                    </a>
                </Link> */}
                <Link prefetch={false} href="/logout">
                    <a className="material-icons" title="Logout" role="link" aria-label="Click to logout" onClick={logout}>logout</a>
                </Link>
            </nav> : <nav role="navigation">
                <div aria-hidden="true"></div>
                <div aria-hidden="true" style={{ width: 32, height: 32 }}></div>
                <a href="/login" role="link" aria-label="Click to proceed to login" title="Login">Login</a>
            </nav>
        }
    </header>
}

function Footer () {
    return <footer role="contentinfo">
        <style jsx>{`
            footer {
                background: #222;
                color: #eee;
                border: 1px solid #333;
                box-sizing: border-box;
                padding: 1em;
            }
            .brand.tmdb {
                color: white;
            }

            .footer-link {
                margin-right: 1em;
            }
        `}
        </style>
        {/* <p>
            This product uses the TMDb API but is not endorsed or certified by <a className="brand tmdb" href={'https://www.themoviedb.org/'}>TMDb.</a>
            We do not claim ownership of any of the images or data in the API.
        </p>
         */}
        <Link href={'/about'}><a className="footer-link" title="Contact us" role="link" aria-label="Click to view about us">Contact us</a></Link>
        <Link href={'/terms'}><a className="footer-link" title="Terms of Service" role="link" aria-label="Click to view terms of service">Terms of Service</a></Link>
        <Link href={'/privacy'}><a className="footer-link" title="Privacy Policy" role="link" aria-label="Click to view privacy policy">Privacy Policy</a></Link>
    </footer>
}

function Sticky () {
    return <div role="alertdialog" className="sticky" style={{
        position: 'sticky',
        bottom: 0,
        margin: 0,
        background: 'orange',
        padding: '0.5em 1em',
        zIndex: '1000',
        color: '#333'
    }}>
        By using this website you agree to the <Link href={{pathname: '/terms'}}>
            <a className="footer-link" title="Terms of Service" role="link" aria-label="Click to view terms of service">Terms of Service</a>
        </Link>.
        We use cookies as described in our <Link href={{pathname: '/privacy'}}>
            <a className="footer-link" title="Privacy Policy" role="link" aria-label="Click to view privacy policy">Privacy Policy</a>
        </Link>.
    </div>
}

function Message ({ children, ...props }) {
    const messageStyles = {
        //background: 'ghostwhite',
        height: '100%',
        color: '#fff',
        fontFamily: 'Tahoma',
        fontSize: '18px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }

    return <div style={messageStyles} {...props}>
        { children }
    </div>
}

function Spinner () {
    return <div role="spinbutton" aria-label="Loading...">
        <style jsx>{`
        // https://www.csswand.dev/
        div {
            height: 40px;
            width: 40px;
            background: rgba(0, 0, 0, 0.4);
            border-radius: 50%;
            border-top: 2px solid orange; //#1D9AF2;
            border-right: 2px solid transparent;
            border-bottom:none;
            border-left:none;
            animation: spinner5 700ms linear infinite;
        }
        @keyframes spinner5 {
            to {
                transform: rotate(360deg);
            }
        }
        `}
        </style>
    </div>
}

function NoScript (props) {
  const staticMarkup = ReactDOMServer.renderToStaticMarkup(props.children)

  return <noscript dangerouslySetInnerHTML={{ __html: staticMarkup }} />
}

function useScrollTop (elementToScroll)  {
    useEffect(() => {
        const handleRouteChange = (/*url*/)=> { 
            document.querySelector(elementToScroll).scrollTo(0, 0) 
        }
      
        Router.events.on('routeChangeComplete', handleRouteChange)
        
        return () => {
          Router.events.off('routeChangeComplete', handleRouteChange)
        }
      }, [elementToScroll])

    return
}

const Layout = withRouter(connect(function ({ user, loading, userUpdatedAt }) { 
    return {
        loading,
        user,
        providers: (user && user.providers) || [],
        userUpdatedAt
    } 
})(function ({ Component, pageProps, dispatch, loading, ...layoutProps }) {
    useScrollTop('#main') // patch scroll to top behavior (note can't opt out)

    const isClient = typeof window !== 'undefined'
    const { providers, user, router } = layoutProps
    const { query } = router
    const parsingQuery = isClient && window.location.search && !Object.keys(query).length

    return <>
        <style jsx>{`
            .root {
                display: flex;
                flex-wrap: wrap;
            }

            #main {
                flex:1;
                display: flex; 
                flex-direction: column;
                position:relative;

                // Forces vertical page scroll to the #main element
                overflow: auto;
                max-height: 100vh;
            }

            .sticky-height {
                min-height: 1em;
            }

            .header-height {
                min-height: 1em;
                margin: 0;
                flex-shrink: 0;
            }

            .nav-link {
                background: ghostwhite;
                margin: 0.5em;
                font-size: 8px;
            }
        `}</style>

        <Aside providers={providers}></Aside>

        <div id="main">
            <div className="header-height">
                <Header user={user} logout={function (e) {
                    e.preventDefault()

                    logout(dispatch)
                }}></Header>
            </div>

            <main style={{ flex: 1 }} role="main">
                <NoScript>
                    <div role="alert" style={{ textAlign: 'center' }}>This site requires javascript. Please enable it and refresh the page.</div>
                </NoScript>
                { loading || parsingQuery ? 
                    <Message><Spinner/></Message>: 
                    <Component {...layoutProps} {...pageProps}></Component> 
                }
            </main>
            
            <Sticky></Sticky>
            <Footer></Footer>
        </div>
    </>
}))

export {
    Header,
    NoScript,
    Footer,
    Sticky,
    Message,
    Spinner,
    Aside,
    Layout
}