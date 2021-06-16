import Router from 'next/router'
import { useCallback, useEffect, useState } from 'react'

function PageLoadingEffect (onChange, verbose) {
    const routeChangeStart = (url) => {
        if (verbose) console.log(`routeChangeStart: ${url}`)
        if (onChange) onChange(false, true)
    }

    const routeChangeError = (url) => {
        if (verbose) console.log(`routeChangeError: ${url}`)
        if (onChange) onChange(true, false)
    }
 
    const routeChangeComplete = (url) => {
        if (verbose) console.log(`routeChangeComplete: ${url}`)
        if (onChange) onChange(false, false)
    }

    Router.events.on('routeChangeError', routeChangeError)
    Router.events.on('routeChangeStart', routeChangeStart)
    Router.events.on('routeChangeComplete', routeChangeComplete)

    return function removeListeners () {
        Router.events.off('routeChangeError', routeChangeError)
        Router.events.off('routeChangeStart', routeChangeStart)
        Router.events.off('routeChangeComplete', routeChangeComplete)
    }
}

export default function usePageLoading (onChange, verbose) {
    const [[failed, loading], setState] = useState([])

    const update = useCallback(function (failed, loading) {
        setState([failed, loading])

        if (onChange) onChange(failed, loading)
    }, [onChange])

    useEffect(function () {
        return PageLoadingEffect(update, verbose)
    }, [verbose, update])

    return [failed, loading]
}
