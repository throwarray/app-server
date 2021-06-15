import Link from './Link'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'

import { makeStyles } from '@material-ui/core/styles'

const useFooterStyles = makeStyles({
    footer: {
        boxSizing: 'border-box',
        padding: '1em'
    },
    footerLink: {
        marginRight: '1em'
    },
    footerLinks: {
        marginTop: '0.5em'
    }
})

export default function Footer () {
    const classes = useFooterStyles()

    return <Paper square elevation={2} className={classes.footer} component="footer" role="contentinfo">
        <Typography variant="caption">
            This product uses the TMDb API but is not endorsed or certified by <Link className="brand tmdb" href={'https://www.themoviedb.org/'}>TMDb</Link>. We do not claim ownership of any of the images or data in the API.
        </Typography>
        <div className={classes.footerLinks}>
            <Link className={classes.footerLink} href={'/about'} title="Contact us" role="link" aria-label="About us">Contact us</Link>
            <Link className={classes.footerLink} href={'/terms'} title="Terms of Service" role="link" aria-label="Terms of Service">Terms of Service</Link>
            <Link className={classes.footerLink} href={'/privacy'} title="Privacy Policy" role="link" aria-label="Click to view privacy policy">Privacy Policy</Link>
        </div>
    </Paper>
}
