import List from 'react-list'

import LazyLoad from 'react-lazy-load'

import { useRef } from 'react'

import { metaQueryItem } from './utils.js'

import Link from 'next/link'

import { useProviderCollection } from './meta'

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
    const { id, /* title, description, */ poster, background } = item

    const ItemLink = item.type == 'collection'? CollectionLink : TitleLink

    return <div className="item" role="listitem">
        <style jsx>{`
            .item {
                display: inline-block;
                padding: 0;
                text-align: center;
                height: max-content;
                position: relative;
            }
            
            .item-content {
                // user-select: none;
                margin: 0.25em;
                margin-bottom: 0;
                height: ${height}px;
                width: ${width}px;   
                position: relative;
            }
            
            .item-card {
                box-sizing: content-box;
                position: absolute;
                width: 100%;
                height: 100%;
                background: ghostwhite;
            }
            
            .item-card:hover {
                border-bottom: 0.125em solid black;
                transform: translateY(-0.125em);
            }

            .item-image {
                width: 100%;
                height: 100%;
                object-fit: scale-down;
            }

            .item-title {
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
        `}
        </style>
        <div className="item-content">
            { id && <div className="item-card" style={{ background: background }} role="img">
                <ItemLink item={item}>
                    <a className="item-link" role="link" aria-label={ item.title || item.id }>
                        <LazyLoad height={'100%'} width={'100%'}>
                            { poster && <img referrerPolicy="same-origin" className="item-image" src={poster} alt="" aria-hidden="false" aria-label={'poster'}/> || <div aria-hidden="true" aria-label={'poster'}></div> }
                        </LazyLoad>
                    </a>
                </ItemLink>
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
    const { userUpdatedAt, width, height, query, providers } = props
  
    // IDEA replace once collection is ready
    const { id, title, page = 1 } =  query // collection

    return <div style={{ padding: '1em', height: 'max-content' }}>
        <CollectionLink item={ query }>
            <a className="collection-title" role="link" aria-label={ title || id }>
                <h3 style={{ margin: '0.5em 0', padding: 0 }}>
                    { title || id }
                </h3>
            </a>
        </CollectionLink>
        <LazyLoad height={height}>
            <CarouselMounted {...{
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
}

// Don't fetch the items until the carousel scrolls into view
function CarouselMounted ({ userUpdatedAt, query, providers, width, id, title, height, componentRef }) {
    const listRef = useRef()
    const { error, data: collection = { ...query } } = useProviderCollection(providers, query, userUpdatedAt)
    const loading = !error && collection == void 0
    const items = collection.items || [{}]

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

    function navPrev (evt) {
        if (evt) evt.preventDefault()

        let { width: w } = componentRef.current.getBoundingClientRect()

        let approxCount = Math.ceil(w / width)            

        let [start = 0, end = approxCount] = listRef.current.getVisibleRange()

        if (start == end) end = start + 1

        let count = end - start 

        if (start) listRef.current.scrollTo(Math.max(start - count, 0))
    }

    function navNext (evt) {
        if (evt) evt.preventDefault()

        let { width:w } = componentRef.current.getBoundingClientRect()
            
        let approxCount = Math.ceil(w / width) // todo handle actual element widths with margins  

        let [start = 1, end = approxCount] = listRef.current.getVisibleRange()

        if (end == start) end = start + 1

        listRef.current.scrollTo(end)
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
                scrollbar-width: thin;
                scrollbar-color: black #333;
                background: #333;
            }

            .nav {
                padding: 0.5em;
                display: flex;
                align-items: center;
                justify-content: center;
                background: black;
                color: #ccc;
                user-select: none;
                cursor: pointer;
            }

            .nav:hover { color: #fff; }

            .nav.back {
                border-top-left-radius: 0.25rem;
                border-bottom-left-radius: 0.25rem;
            }

            .nav.next {
                border-top-right-radius: 0.25rem;
                border-bottom-right-radius: 0.25rem;
            }
        
            .nav > i { width: 1em; }
        `}</style>

        <div tabIndex={0} role="button" aria-label="Go to previous page" className="nav back" onClick={navPrev}><i className="material-icons">arrow_backward</i></div>
        <div className="component" ref={componentRef} style={{ minHeight: height }}>
        { loading? 
            <div style={messageStyles}>Loading {title || id } ...</div>: 
            error? <div style={messageStyles}>Error</div>: 
            <div role="list" tabIndex="-1">
                <List ref={listRef} axis="x" itemRenderer={ renderItem } length={items.length} type='uniform'/>
            </div>
        }
        </div>
        <div tabIndex={0} role="button" aria-label="Go to next page" className="nav next" onClick={navNext}><i className="material-icons">arrow_forward</i></div>
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
            <a className="collection-title" role="link" aria-label={title || id}>
                <h3 style={{ margin: '0.5em', padding: 0 }}> { title || id }</h3>
            </a>
        </CollectionLink>

        <div style={{ margin: '0.5em' }}>{
            items.map((item,i)=> {
                return <Item key={item.id + '-' + i } width={width} height={height} item={item}/>
            })
        }</div>

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
        { <div className="nav">
            { page > 1 && <CollectionLink item={{ ...query, page: Math.max(page - 1, 1) }}>
                <a className="next" role="link" aria-label={'Go to the previous page'}><i className="material-icons">arrow_backward</i></a>
            </CollectionLink> }

            <div className="pagination-info">{ page } / { pageCount || '∞'/*'∞⧜'*/ }</div>

            { collection.items && collection.items.length && <CollectionLink item={{ ...query, page: page && Math.min(page + 1, pageCount || Infinity) }}>
                <a className="next" role="link" aria-label={'Go to the next page'}><i className="material-icons">arrow_forward</i></a>
            </CollectionLink> }
        </div>}
    </div>
}