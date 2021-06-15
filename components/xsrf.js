import { useEffect, useState } from 'react'

import { parse as parseCookies } from 'cookie'

export function useToken (initialToken) {
    const [token, setToken] = useState(initialToken)

    useEffect(function () {
        const cookies = parseCookies(document.cookie)

        setToken(cookies['XSRF-TOKEN'])
    }, [])

    return token
}