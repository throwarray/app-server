import { useRef, useState, useMemo, useCallback } from 'react'
import { Message } from '../components/Layout'
import { fetch } from '../components/fetch'
import { trigger } from 'swr'
import Head from 'next/head'

function refreshUserState () { trigger('/user') }

export default function ({ providers, user }) {
    const offline = typeof navigator !== 'undefined' && !navigator.onLine
    
    return <>
        <Head>
            <title key="page-title">Settings | App</title>
            <meta key="page-description" name="Description" content="Settings | App"/>
        </Head>
        {
            !user? <Message><div>Please login to add providers.</div></Message>:
            offline? <div>An internet connection is required to update settings.</div> :
            <Page providers={providers}></Page>
        }
    </>
}

function formBody (obj) {
    return Object.keys(obj).map(function (key) {
        const val = obj[key]
        const k = global.encodeURIComponent(key)
        
        if (val === void 0)
        return k === void 0 ? '' : k
        else
        return `${k}=${global.encodeURIComponent(val)}`
    }).join('&')
}

function Page ({ providers }) {
    const [state, setState] = useState({})
    
    const formRef = useRef()
        
    const id_pattern = '^\\w+\\b$'
    const ids_pattern = '^(?:(?:\\w+(?:,\\w+)?)+|\\*)$'
    const submitForm = useCallback(function (evt) {
        evt.preventDefault()

        const form = evt.target
        const action = form.getAttribute('action')
        const inputs = Array.prototype.slice.call(form.querySelectorAll('input'))
        const form_map = Object.create(null)
        
        inputs.forEach(function (input) {
            const name = input.getAttribute('name')
            
            form_map[name] = input.value
        })

        form.reset()
 
        if (action) fetch(action, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formBody(form_map),
            method: 'POST'
        }).then(refreshUserState, refreshUserState)
    }, [])

    const formDefaults = useMemo(function () {
        if (providers && state.modify) {
            const provider = providers.find(provider=> { 
                return provider.id === state.modify 
            })
    
            if (provider) {
                const { streams, meta, collections } = provider
    
                return {
                    id: provider.id,
                    title: provider.title,
                    url: provider.url,
                    streams: streams.join(','),
                    meta: meta.join(','),
                    collections: collections.join(',')
                }
            }
        }

        return {}
    }, [providers, state.modify])

    return <div>
    <style>{`
        .providers {
            background: #444;
            min-height: 100px;
            margin: 1em;
        }
        .providers .material-icons {
            margin: 0.25em;
        }
    `}</style>

    <div className="providers">
        <h3>Providers</h3>
        <div>{
            providers? providers.map(provider => {
                const selected = provider.id === state.modify

                return <div key={provider.id}>
                    <div style={{ 
                        display: 'flex', 
                        padding: '1em', 
                        margin: '0.25em',
                        background: '#eee',
                        color: '#333',
                        flexWrap: 'wrap',
                        border: selected? '3px solid green' : 'none'
                    }}>
                        <div>{provider.id}</div>
                        <div style={{ flex: 1 }}></div>
                        
                        <li className="material-icons" onClick={()=> {                           
                            setState(state => { return { ...state, modify: provider.id } })

                            formRef.current.scrollIntoView()
                        }}>settings</li>

                        <form method="POST" action="/api/providers/remove" onSubmit={submitForm}>
                            <input type="text" name="id" style={{ display: 'none' }} defaultValue={provider.id}></input>
                            <button>
                                <li className="material-icons">delete</li>
                            </button>
                        </form>
                    </div>
                </div>
            }) : null
        }
        </div>
    </div>

    <form className="add_provider" ref={formRef} method="POST" action="/api/providers/add" onSubmit={submitForm}>
        <style>{`
            .add_provider { margin: 1em; }
            .add_provider label { display: block; }
            .add_provider input { margin: 0.5em; }
        `}</style>

        <h3>Add / Edit provider</h3>

        <label htmlFor="id">Provider ID*</label>
        <input maxLength="16" required={true} pattern={id_pattern} type="id" name="id" defaultValue={formDefaults.id}></input>

        <label htmlFor="url">URL**</label>
        <input maxLength="500" required={true} type="text" pattern="^.+" name="url" defaultValue={formDefaults.url}></input>

        <label htmlFor="title">Title</label>
        <input name="title" maxLength="50" defaultValue={formDefaults.title}></input>

        <label htmlFor="streams">Streams***</label>
        <input maxLength="400" name="streams" pattern={ids_pattern} defaultValue={formDefaults.streams}></input>
        
        <label htmlFor="meta">Meta***</label>
        <input maxLength="400" name="meta" pattern={ids_pattern} defaultValue={formDefaults.meta}></input>

        <label htmlFor="collections">Collections***</label>
        <input maxLength="400" name="collections" pattern={ids_pattern} defaultValue={formDefaults.collections}></input>

        <p>* Unique id. When id is already in use the existing provider will be modified.</p>
        <p>** Provider endpoint url with public /streams|collection|meta routes</p>
        <p>*** Optional comma seperated list of provider ids. I.e tmdb,my_provider</p>
        <button>Submit</button>
    </form>
    </div>
}

