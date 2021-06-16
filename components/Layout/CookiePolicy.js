import Paper from '@material-ui/core/Paper'
import Link from './Link'
import { makeStyles } from '@material-ui/core/styles'

const useCookiePolicyStyles = makeStyles({
    dialog: {
        position: 'sticky',
        bottom: 0,
        margin: 0,
        padding: '0.5em 1em',
        zIndex: '1',
    }
})

export default function CookiePolicy () {
    const classes = useCookiePolicyStyles()

    return <Paper square severity="warning" elevation={0} role="alertdialog" className={classes.dialog}>
        By using this website you agree to the <Link href={{pathname: '/terms'}} title="Terms of Service" role="link" aria-label="Terms of service">
            Terms of Service
        </Link>.
        We use cookies as described in our <Link href={{pathname: '/privacy'}} title="Privacy Policy" role="link" aria-label="Privacy policy">
            Privacy Policy
        </Link>.
    </Paper>
}