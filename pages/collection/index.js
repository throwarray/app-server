// Handle /
import Page from './[id].js'
import { useMemo } from 'react'

const HOME_COLLECTION = 'system-home'

export default function CollectionPage (props) {
    const { query: routerQuery } = props.router

    const query = useMemo(function () { 
        return { id: HOME_COLLECTION, ...routerQuery } 
    }, [routerQuery])

    return <Page {...props} query={query}/>
}
