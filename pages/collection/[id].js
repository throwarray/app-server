import useSWR from 'swr'

import { Collection, Carousel } from '../../components/carousel'

import { fetchCollection, metaQueryItem } from '../../components/utils'

import { Message, Spinner } from '../../components/Layout'

import Head from 'next/head'

export default function (props) {
    const { router } = props
    const { query } = router
    const id = query.id
    const title = `Collection ${ query.title || id || '' } | App`

    return <>
        <Head>
            <title key="page-title">{title}</title>
            <meta key="page-description" name="Description" content={title}/>
        </Head>
        <Page {...props} query={query}></Page> 
    </>
}

function Page (props) {
    const { query, providers, userUpdatedAt } = props
    const widthMax = 200
    const heightMax = 300
    const urlCacheKey = `#collection|${query.type}|${query.id}|${query.page}|${userUpdatedAt}`
    const { error, data: collection } = useSWR(urlCacheKey, async function () {
        if (Array.isArray(providers)) 
        {
            const filtered_query = metaQueryItem(query)

            const collection = await fetchCollection(filtered_query, providers)

            return collection
        }
    }, {
        revalidateOnFocus: false,
        refreshWhenHidden: false,
        shouldRetryOnError: false 
    })

    const fetching = !error && collection == void 0

    if (fetching) return <Message><Spinner/></Message>
    
    else if (error) return <Message>Error</Message>

    else if(!collection) return <Message>Please login and add providers to continue.</Message>
    
    return collection.type === 'collection'? <div style={{ margin: '1em' }}> {
        collection.items.map((item, i)=> {
            const height = Math.min(item.height || heightMax, heightMax)
            const width = Math.min(item.width || widthMax, widthMax)

            return <Carousel
                userUpdatedAt={userUpdatedAt}
                key={item.id + '-' + i } 
                query={item}
                providers={providers}
                height={height}
                width={width}
            />
        })
    }</div>:
    <Collection
        query={query}
        collection={collection}
        providers={providers}
        height={ Math.min(collection.height || heightMax, heightMax) }
        width={ Math.min(collection.width || widthMax, widthMax) }
    />
}
