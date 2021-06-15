import List from 'react-list'

import LazyLoad from 'react-lazy-load'

import { useRef, useCallback } from 'react'

import { metaQueryItem } from './utils.js'

import Link from 'next/link'

import { useProviderCollection } from './meta'

import Alert from '@material-ui/lab/Alert'
import Skeleton from '@material-ui/lab/Skeleton'
import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import ArrowLeft from '@material-ui/icons/NavigateBefore'
import ArrowRight from '@material-ui/icons/NavigateNext'

function useNavigationHandlers (itemWidth, items, listRef, componentRef) {
    // The list is virtualized so there's two refs
    // The list ref measures the visibility range and the component ref
    // measures the actual component width.

    const navPrev = useCallback(function navPrev (evt) {
        const list = listRef && listRef.current
        const component = componentRef && componentRef.current

        if (evt) evt.preventDefault()

        if (!items.length) return

        if (!component || 
            !component.getBoundingClientRect ||
            !list || 
            !list.getVisibleRange
        ) return

        let { width } = component.getBoundingClientRect()

        let approxCount = Math.ceil(width / itemWidth)

        let [start = 0, end = approxCount] = list.getVisibleRange()

        if (start == end) end = start + 1

        let count = (end - start) - 1

        if (start >= 1) list.scrollTo(Math.max(start - count, 0))

        else list.scrollTo(items.length - 1)
    }, [itemWidth, items, listRef, componentRef])

    const navNext = useCallback(function navNext (evt) {
        const list = listRef && listRef.current
        const component = componentRef && componentRef.current

        if (evt) evt.preventDefault()
        
        if (!items.length) return

        if (!component || 
            !component.getBoundingClientRect ||
            !list || 
            !list.getVisibleRange
        ) return
        
        let { width } = component.getBoundingClientRect()
        
        let approxCount = Math.ceil(width / itemWidth)
        
        let [start = 1, end = approxCount] = list.getVisibleRange()
        
        if (end == start) end = start + 1
        
        if (end === items.length - 1) list.scrollTo(0)

        else list.scrollTo(Math.min(end, items.length - 1))
    }, [itemWidth, items, listRef, componentRef])

    return [navPrev, navNext]
}


function CollectionLink ({ item, children }) {
    const { id, type, ...query } = metaQueryItem(item)

    return <Link href={{ pathname: '/collection/[id]', query }} as={{ pathname: `/collection/${id}`, query }}>
        { children }
    </Link>
}

function TitleLink ({ item, children }) {
    const { id, type, ...metaQuery } = metaQueryItem(item)

    return <Link href={{ pathname: '/title/[type]/[id]', query: metaQuery }} as={{ pathname: `/title/${type}/${id}/`, query: metaQuery }}>
        { children }
    </Link>
}



export function Item ({ width, height, item, /*dest = '/title'*/ }) {
    const { id, poster, /* title, description, background */ } = item

    const ItemLink = item.type == 'collection'? CollectionLink : TitleLink

    return <div className="item" role="listitem">
        <style jsx>{`
        .item {
            vertical-align: top;
            white-space: nowrap;
            display: inline-block;
            text-overflow: ellipsis;
            padding: 0;
            text-align: center;
            height: max-content;
            position: relative;
            scroll-snap-align: start;
        }

        .item-card {
            box-sizing: content-box;
            position: absolute;
            width: 100%;
            height: 100%;
            // background: ghostwhite;
        }
        
        .item-card:hover {
            // border-bottom: 0.125em solid transparent;
            // transform: translateY(-0.125em);
        }

        .item-card:hover > .item-title {
            display: initial;
        }

        .item-title {
            display: none;
            
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(255, 255, 255, 0.65);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            color: #333;

        }

        .item-title h3 { margin-top: 0; margin-bottom: 0; }

        .item-link {
            display: block; 
            height: 100%;
        }       
        `}</style>
        <div style={
            {
                width: `${width}px`,
                height: `${height}px`,
                // margin: '0.25em',
                // marginBottom: '0',

                position: 'relative'
            }
        }>
            { id && <div className="item-card" role="img">{/* style={{ background: background }}  */}
                <Paper style={{ height: '100%' }} elevation={2}>
                    <ItemLink item={item}>
                        <Typography role="link" component="a" aria-label={ item.title || item.id } style={{ display: 'block', height: '100%' }}>
                            <LazyLoad 
                                //NOTE This isn't being applied
                                style={{ width: 'inherit', height: 'inherit' }}
                                offsetHorizontal={width * 2} 
                                debounce={false} 
                                throttle={100}
                            >
                                { poster && 
                                    <img 
                                        loading="lazy"
                                        alt=""
                                        aria-hidden="false" 
                                        aria-label="poster"
                                        style={{ display: 'block', objectFit: 'cover', width: '100%', height: '100%' }}
                                        referrerPolicy="same-origin" 
                                        width="100%" 
                                        height="100%" 
                                        src={poster/*  || "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D"  */}
                                    /> || <div aria-hidden="true" aria-label={'poster'}></div> }
                            </LazyLoad>
                        </Typography>
{/* 
                        <a className="item-link" role="link" aria-label={ item.title || item.id }>
                        </a> */}
                    </ItemLink>
                </Paper>
                <div className="item-title">
                    <ItemLink item={item}>
                        <a tabIndex={-1} role="link" aria-label={item.title || item.id } title={item.title || item.id}><h3>{ item.title }</h3></a>
                    </ItemLink>
                </div>
            </div> || null }
        </div>
    </div>
}

export function Carousel (props) {  
    const componentRef = useRef()
    const { userUpdatedAt, width, height, query, providers, collection } = props
  
    // IDEA replace once collection is ready
    const { id, title, page = 1 } =  query || collection

    return <div style={{ marginBottom: '1em', padding: '1em', height: 'max-content' }}>
        <CollectionLink item={ { id, title, page } }>  
            <a style={{ color: 'inherit' }} role="link" aria-label={ title || id }>
                {/* 55px is the width of the nav prev / next */}
                <Typography variant="h6" style={{ margin: '0.5em 55px', padding: 0 }}>
                    { title || id }
                </Typography>
            </a>
        </CollectionLink>
        {/* Don't fetch the items until the carousel scrolls into view */}
        <div style={{ height }}>
            <LazyLoad height={'100%'}>
                <CarouselMounted {...{
                    collection,
                    userUpdatedAt,
                    id,
                    title,
                    page,
                    width,
                    height,
                    componentRef,
                    query,
                    providers
                }}></CarouselMounted>
            </LazyLoad>
        </div>
    </div>
}




// function effect (fn, props) { return [fn.bind(null, ...(props||[])), props] }
// useEffect(...effect(function (one, two) {}, [1, 2]))





function CarouselMounted ({ 
    collection: supplied_collection,
    userUpdatedAt, query: supplied_query, providers, width, /*id, title,*/ height, componentRef }) {

    const listRef = useRef()
    const query = supplied_collection || supplied_query

    const { error, data: collection = { ...query } } = useProviderCollection(providers, query, userUpdatedAt, supplied_collection)
    const loading = !error && collection == void 0
    const items = collection.items || [{}]
    const [navPrev, navNext] = useNavigationHandlers(width, items, listRef, componentRef)

    const messageStyles = {
        //background: 'ghostwhite',
        height: '100%',
        color: '#fff',
        fontDisplay: 'fallback',
        fontFamily: 'Tahoma',
        fontSize: '18px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }

    function renderItem (index) {
        const data = items[index]
        return <Item key={data.id || 0 } item={data} width={width} height={height}></Item> 
    }



    return <div className="component-wrapper">
        <style jsx>{`
            .component-wrapper {
                display: flex;
                width: 100%;
            }
            
            .component {
                white-space: nowrap;
                flex: 1;
                overflow: auto;
                // overflow-x: scroll;
                // overflow-y: hidden;
                scrollbar-width: thin;
                scrollbar-color: black #333;
                scroll-snap-type: x proximity; //mandatory proximity
                scroll-padding: 0.25em;
                // background: #333;
                scroll-behavior: smooth;
            }

        `}</style>



        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            padding: '0.25em'
        }}>
            <IconButton
                tabIndex={0} 
                onClick={navPrev} 
                aria-label="previous page"
                title="previous page"
                size="medium"
            >
                <ArrowLeft fontSize="inherit"/>
            </IconButton>
        </div>


        <div className="component" ref={componentRef} style={{ minHeight: height }}>
        {
            loading? 
                <Skeleton variant="rect" width="100%" height="100%"/>: 
            error? 
                <Paper style={{ ...messageStyles, width: '100%', height: '100%' }}>
                    <Alert severity="warning">
                        Failed to load collection
                    </Alert>
                </Paper>:
            //!!data
                <div role="list" tabIndex="-1">
                    {/* {
                        Array.from({ length: 100 }, function (_, index) {
                            return <Item 
                                key={index}
                                item={{
                                    id: 'example-bbb',
                                    type: 'movie',
                                    title: 'Big Buck Bunny',
                                    background: 'blue',
                                    poster: ''//'/poster_bbb.jpg'
                                }} 
                                width={width}
                                height={height}
                            />
                        })
                    } */}

                    <List 
                        ref={listRef} 
                        axis="x" 
                        itemRenderer={ renderItem } 
                        length={items.length} 
                        type='uniform'
                    />
                </div>
        }
        </div>

        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            padding: '0.25em'
        }}>
            <IconButton
                tabIndex={0} 
                onClick={navNext} 
                aria-label="next page"
                title="next page"
                size="medium"
            >
                <ArrowRight fontSize="inherit"/>
            </IconButton>
        </div>
    </div>
}

export function Collection  (props) {
    const { query, width, height, collection = {} } = props
    const { pageCount, items = [] } = collection

    const page = Number(collection.page) || 1

    // const hasMore = page < pageCount
    // const hasPrev = page > 1

    const { id, title } = collection
    const route = { id, title, page }

    return <div>
            <CollectionLink item={route}>
                <a role="link" aria-label={title || id}>
                <Typography variant="h6" style={{ margin: '0.5em', padding: 0 }}>
                    { title || id }
                </Typography>
                </a>
            </CollectionLink>

        <style jsx>{`
        .nav {
            color: #333;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 1em;
        }
        .prev, .next {
            background: ghostwhite;
            padding: 1em;
            flex: 1;
            text-align: center;
            display: block;
            max-width: 200px;
        }

        .prev i, .next i {
            width: 1em;
        }

        .pagination-info {
            text-align: center;
            padding: 1em;
            background: #eee;
            flex: 1;
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        `}</style>

        <style>{`
        .items {
            margin: 0.5em;
            display: flex;
            justify-content: space-around;
            
            display: grid;
            grid-template-columns: repeat(auto-fill, ${width}px);
            grid-gap: 0.5em;
        }
        `}</style>
        
        {/* Uses grid to center items horizontally while keeping the last row aligned to the left baseline */}
        <div className="items">{
            items.map((item,i)=> {
                return <Item key={item.id + '-' + i } width={width} height={height} item={item}/>
            })
        }</div>

        { <div className="nav">
            { page > 1 && <CollectionLink item={{ ...query, page: Math.max(page - 1, 1) }}>
                <a className="prev" role="link" aria-label={'previous page'}><ArrowLeft /></a>
            </CollectionLink> }

            <div className="pagination-info">{ page } / { pageCount || '∞'/*'∞⧜'*/ }</div>

            { collection.items && collection.items.length && (!pageCount || page + 1 < pageCount) && <CollectionLink item={{ ...query, page: page && Math.min(page + 1, pageCount || Infinity) }}>
                <a className="next" role="link" aria-label={'next page'}><ArrowRight /></a>
            </CollectionLink> }
        </div>}
    </div>
}