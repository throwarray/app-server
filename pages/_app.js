// import '../static/style.css'
import useSWR from 'swr'
import Head from 'next/head'
import { fetch } from '../components/fetch'
import { Provider } from 'react-redux'
import { useStore, login, loading } from '../components/store.js'

import { batch } from 'react-redux'
import { Layout } from '../components/Layout'
import { useEffect } from 'react'

export default function PageWrapper ({ Component, pageProps }) {
    const store = useStore(pageProps.initialReduxState)
    const dispatch = store.dispatch
  
    const { data: user, error } = useUser()

    useEffect(function () {
        console.log('user updated', error && 'Unauthenticated' || user)

        batch(()=> {
            dispatch(login(error? null : user))
            if (error || user) dispatch(loading(false))
        })
    }, [dispatch, error, user])
  
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
        <Provider store={ store }>
            <Layout Component={ Component } pageProps={pageProps}/>
        </Provider>
    </div>
}



function useUser (props) {
    return useSWR('/api/user', async function () {
        const response = await fetch('/api/user')
        const isUnauthenticated = response.status >= 400 || response.status < 200
        
        if (isUnauthenticated) throw new Error('Unauthenticated')
    
        const user = await response.json() 
    
        return user
    }, {
        shouldRetryOnError: false,
        ...props
    })
}