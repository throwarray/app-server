import nextConnect from 'next-connect'

export default function createRouter (options) {
    const IS_DEV = process.env.NODE_ENV !== 'production'

    return nextConnect({
        onError (err, req, res, next) {
            if (IS_DEV) 
            {
                console.error(err)
            }

            res.status(500)
            res.end(IS_DEV && err.message || 'error')
        },
        ...options
    })
}