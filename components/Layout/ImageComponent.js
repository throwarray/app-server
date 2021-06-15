import Skeleton from '@material-ui/lab/Skeleton'
import Typography from '@material-ui/core/Typography'
import { useTheme } from '@material-ui/core/styles'
import { useCallback, useEffect, useRef, useState } from 'react'

export function useImageStatus (src, ref) {
    const [state, setState] = useState({ loaded: false, error: false })
    const source = useRef()
    const defaultRef = useRef()
    const imageRef =  ref || defaultRef
    const imageElem = imageRef && imageRef.current    
    const loading = imageElem && (!state.error && !state.loaded)
    const onLoad = useCallback(function onLoad () { setState(_state => ({ loaded: true, error: false })) }, [])
    const onError = useCallback(function onError () { setState(_state => ({ loaded: false, error: true })) }, [])

    useEffect(function () {
        if (!imageElem) return

        // Check if src arg changed
        const isSourceChange = source.current && source.current !== src

        source.current = src

        // Missing or empty source prop is an error
        if (!imageElem.src) // || imageElem.naturalWidth === 0) 
            return setState(_state => ({ loaded: false, error: true }))

        // Image already loaded
        if (imageElem.complete) 
            return setState(_state => ({ loaded: true, error: false }))

        // Reset internal state when src prop changes
        if (isSourceChange)
            return setState(_state => ({ loaded: false,  error: false }))        
    }, [imageElem, src])

    return {
        src,
        ref: imageRef,
        onError: onError,
        onLoad: onLoad,
        loading,
        mounted: !!imageElem,
        ...state
    }
}

export default function LazyImage ({ width, height, src, ...imageProps }) {
    const {
        // mounted,
        // loaded,
        error,
        loading,
        onError,
        onLoad,
        ref
    } = useImageStatus(src)

    const theme = useTheme()

    return <>
        {/* Hidden once loading. ssr. */}
        <style jsx>{`img { display: ${(loading || error ? 'none' : 'block')} }`}</style>
        { <img
            {...imageProps}
            // className={(loading? "loading": error? 'error' : loaded? 'loaded' : 'waiting' )}
            src={src}
            width={width} 
            height={height}
            ref={ref}
            onError={onError}
            onLoad={onLoad}
        /> }

        {/* Show a skeleton while loading the image component. no ssr. */}
        { loading && <Skeleton variant="rect" width={width} height={height}/> || null }

        { error && <Skeleton variant="rect" width={width} height={height} animation={false}>
            {/* Show an error message when the image failed to load. no ssr. */}
            {/* Center message and use theme color */}
            <div style={{ 
                width, height,
                color: theme.palette.text.secondary,
                display: 'flex',
                overflow: 'hidden',
                visibility: 'initial', // skeleton sets as hidden
                alignItems: 'center', // vertical align
                pointerEvents: 'none',
            }}>
                <Typography variant="h6" style={{
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    margin: '0 auto',
                    padding: '8px',
                }}>
                    Error
                </Typography>
            </div>
        </Skeleton> || null }
    </>
}