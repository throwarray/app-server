import Head from 'next/head'

import img_src from '../public/tmdb.svg'


export default function () {
    return <div>
        <Head>
            <title key="page-title">About | App</title>
            <meta key="page-description" name="Description" content="About | App"/>
        </Head>

        <h3>About</h3>

        <div>
            <a href={'https://www.themoviedb.org/'} rel="noopener" aria-label={'Click to visit the TMDb website'}>
                <img referrerPolicy="same-origin" style={{width: 208 / 4 }} src={img_src} alt=""></img>
            </a>
        </div>

        This product uses the TMDb API but is not endorsed or certified by <a className="brand tmdb" href={'https://www.themoviedb.org/'}>TMDb</a>.
        We do not claim ownership of any of the images or data in the API.        
    </div>
  }

