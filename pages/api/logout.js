import passportMiddleware from './_middleware/passport'
import createRouter from './_middleware/createRouter'
import { destroySession } from './_middleware/session'
import { URL } from 'url'
import { stringify as stringifyQuery } from 'querystring'
import { format as utilFormat } from 'util'

const router = createRouter()

const POST_LOGOUT_REDIRECT_URI = process.env.POST_LOGOUT_REDIRECT_URI || '/'

router.use(
    passportMiddleware, 
    destroySession,
    (req, res) => {
        const returnTo = new URL(req.query && req.query.returnTo || POST_LOGOUT_REDIRECT_URI, process.env.APP_URL).toString()

        const logoutURL = new URL(utilFormat('https://%s/logout', process.env.AUTH0_DOMAIN))

        logoutURL.search = stringifyQuery({ 
            client_id: process.env.AUTH0_CLIENT_ID, 
            returnTo
        })

        // Logout of Auth0 and redirect back to returnTo
        res.redirect(302, logoutURL.toString())
        res.end('')
    }
)

export default router