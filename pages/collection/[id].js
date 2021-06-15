import { Collection, Carousel } from '../../components/carousel'
import Message from '../../components/Layout/Message'
import { useProviderCollection } from '../../components/meta'
import Head from 'next/head'
import CircularProgress from '@material-ui/core/CircularProgress'

export default function CollectionItemPage (props) {
    const { query = props.router.query } = props
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
    const { query, providers = [], userUpdatedAt } = props
    const widthMax = 200
    const heightMax = 300
    const { error, data: collection } = useProviderCollection(providers, query, userUpdatedAt)
    const fetching = !error && collection == void 0

    if (fetching) return <Message><CircularProgress/></Message>
    
    else if (error) return <Message>Error</Message>

    else if(!collection) return <Message>Please login and add providers to continue.</Message>

    return <>{(collection.type === 'collection') ? (<div style={{ margin: '1em' }}> {
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
    }</div>):
    (<Collection
        query={query}
        collection={collection}
        providers={providers}
        height={ Math.min(collection.height || heightMax, heightMax) }
        width={ Math.min(collection.width || widthMax, widthMax) }
    />)
    }
    </>
}
