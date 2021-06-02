import nextConnect from 'next-connect'

// Default route handler
export default function createRouter (options) {
    const IS_DEV = process.env.NODE_ENV !== 'production'

    // Default error handler and 404 handler    
    function onerror (err, _req, res, _next) {
        if (IS_DEV) console.error(err) // log errors during development.

        res.status(err.status || 500)

        res.end(IS_DEV && err.message || 'error')
    }

    const router = nextConnect({
        attachParams: true, // Add req.params
        onError: onerror,
        onNoMatch: onerror.bind(null, { status: 404, message: 'not found' }),
        ...options
    })

    //router.use(someMiddleware)

    return router
}
