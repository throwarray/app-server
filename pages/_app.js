// import '../static/style.css'
import useSWR from 'swr'
import Head from 'next/head'
import App from 'next/app'
import { fetch } from '../components/fetch'
import { Provider } from 'react-redux'
import { initializeStore, login, loading } from '../components/store.js'
import { ThemeContext, themes }  from '../components/theme-context.js'
import { batch } from 'react-redux'
import { Layout } from '../components/Layout'
import { useEffect } from 'react'

export default class extends App {
    constructor (...props) {
        super(...props)

        const initialState = { loading: true, user: null }

        this.reduxStore = initializeStore(initialState)
    }

    render  () {
        const { pageProps, Component } = this.props

        return <div className="main-content" style={{ display: 'flex '}}>
            <style jsx global>{`
                body { 
                    margin: 0; 
                    background: #333;
                    color: #fff;
                    font-family: Lato;
                }

                a { color: inherit; }
                
                * { box-sizing: border-box; }
                
                #jwplayplay {
                    margin: 1em auto;
                    width: 320px !important;
                    height: 180px !important;
                }
            `}</style>

            <Head>
                <title key="page-title">Loading... | App</title>
                <meta key="page-description" name="Description" content="Loading... | App"/>
            </Head>
            <PageWrapper Component={Component} pageProps={pageProps} store={this.reduxStore}></PageWrapper>
        </div>
    }
}

function useUser (props) {
    return useSWR('/user', async function () {
        const response = await fetch('/user')
        const isUnauthenticated = response.status >= 400 || response.status < 200
        
        if (isUnauthenticated) throw new Error('Unauthenticated')
    
        const user = await response.json() 
    
        return user
    }, {
        shouldRetryOnError: false,
        ...props
    })
}

function PageWrapper ({ Component, pageProps, store }) {
    const dispatch = store.dispatch
    const { data: user, error } = useUser()

    useEffect(function () {
        console.log('user updated', error, user)

        batch(()=> {
            dispatch(login(error? null : user))
            if (error || user) dispatch(loading(false))
        })
    }, [dispatch, error, user])

    return <Provider store={ store }>
        <ThemeContext.Provider value={themes.dark}>
            <Layout Component={ Component } pageProps={pageProps}/>
        </ThemeContext.Provider>
    </Provider>
}
