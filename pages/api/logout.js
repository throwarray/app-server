import passportMiddleware from './_middleware/passport'
import createRouter from './_middleware/createRouter'
import querystring from 'querystring'
import util from 'util'
import { URL } from 'url'

const router = createRouter()

router.use(
    passportMiddleware, 
    (req, res) => {
        if (req.logout) req.logout()
        
        let returnTo = new URL('/', process.env.APP_URL).toString()

        const logoutURL = new URL(util.format(
            'https://%s/logout', 
            process.env.AUTH0_DOMAIN
        ))

        //res.redirect(logoutURL)
        const searchString = querystring.stringify({
            client_id: process.env.AUTH0_CLIENT_ID,
            returnTo: returnTo
        })
        
        logoutURL.search = searchString
        
        res.status(302)
        res.setHeader('location', logoutURL.toString())
        res.end('')
    }
)

//export default (req, res) => router.apply(req, res)
export default router