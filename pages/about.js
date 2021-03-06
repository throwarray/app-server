import Link from '../components/Layout/Link'
import Head from 'next/head'
import Typography from '@material-ui/core/Typography'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import { useTheme } from '@material-ui/core'

function TMDBLogo ({ color = '#081c24' }) {
    return <svg 
        id="Layer_1" 
        data-name="Layer 1" 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 160.02 174.22"
        style={{width: 208 / 4, fill: color }}
    >
        <defs><style>{`.cls-1{fill:${color}}`}</style></defs>
        <title>Stacked_Blue</title>
        <path 
            className="cls-1" 
            d="M2868.25,2996c15.29,0,25.63-10.34,25.63-25.63v-107.7c0-15.29-10.34-25.63-25.63-25.63H2759.5c-15.29,0-25.63,10.34-25.63,25.63v148.58L2747,2996h0V2862.67a12.5,12.5,0,0,1,12.48-12.48h108.75a12.5,12.5,0,0,1,12.48,12.48v107.7a12.5,12.5,0,0,1-12.48,12.48H2777L2763.86,2996l-0.08-.1" transform="translate(-2733.87 -2837.04)"/><path className="cls-1" d="M2790.55,2920.27h-12.32v41.36h12.32C2818.08,2961.63,2818.08,2920.27,2790.55,2920.27Zm0,33.09h-4v-24.82h4C2806.63,2928.54,2806.63,2953.35,2790.55,2953.35Z" transform="translate(-2733.87 -2837.04)"/><polygon className="cls-1" points="54.28 75.41 62.55 75.41 62.55 42.32 72.84 42.32 72.84 34.11 43.98 34.11 43.98 42.32 54.28 42.32 54.28 75.41"/><polygon className="cls-1" points="94.98 52.27 80.67 34.11 78.01 34.11 78.01 76.1 86.4 76.1 86.4 53.02 94.98 64.13 103.57 53.02 103.51 76.1 111.9 76.1 111.9 34.11 109.29 34.11 94.98 52.27"/><path className="cls-1" d="M2842.79,2940.95c2.6-1.79,3.7-5,3.82-8.16,0.17-7.29-4.4-12.55-11.74-12.55H2818.5v41.42h16.37a12.3,12.3,0,0,0,12.2-12.44A10,10,0,0,0,2842.79,2940.95Zm-16-12.44h7.35c2.37,0,3.82,1.85,3.82,4.16a3.87,3.87,0,0,1-3.82,4.17h-7.35v-8.33Zm7.35,24.87h-7.35v-8.27h7.35a4.06,4.06,0,0,1,4.16,4.11A4.11,4.11,0,0,1,2834.18,2953.38Z" 
            transform="translate(-2733.87 -2837.04)"
        />
    </svg>
}

export default function AboutPage () {
    const theme = useTheme()

    return <>
        <Head>
            <title key="page-title">About | App</title>
            <meta key="page-description" name="Description" content="About | App"/>
        </Head>
        <Container maxWidth="md">
            <Typography variant="h3" style={{ marginTop: '0.5em', marginBottom: '0.5em' }}>About</Typography>
            <Grid container spacing={2}>
                <a 
                    href={'https://www.themoviedb.org/'} 
                    rel="noopener" 
                    aria-label={'Click to visit the TMDb website'}
                >
                    <TMDBLogo color={theme.palette.text.primary}/>
                </a>
                <Grid item md={10}>
                    <Typography variant="body1">
                        This product uses the TMDb API but is not endorsed or certified by <Link className="brand tmdb" href={'https://www.themoviedb.org/'}>TMDb</Link>.
                        We do not claim ownership of any of the images or data in the API.
                    </Typography>
                </Grid>
            </Grid>
        </Container>
    </>
  }

