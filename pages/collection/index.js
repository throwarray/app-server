// Handle /

import Page from './[id].js'

import { useMemo } from 'react'

const HOME_COLLECTION = 'system-home'

export default function (props) {
    const { query: routerQuery } = props.router

    const query = useMemo(function () {
        return {
            ...routerQuery,
            id: routerQuery.id || HOME_COLLECTION
        }
    }, [routerQuery])

    return <Page {...props} query={query}></Page>
}
