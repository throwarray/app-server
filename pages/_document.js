// ./pages/_document.js
import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html lang="en">
        <Head>
            <meta name="referrer" content="origin"/>
            <link rel="preconnect" href="https://tmdb.org"></link>
            <link rel="preconnect" href="https://image.tmdb.org"></link>
            <link media="all" key="font-lato" href="https://fonts.googleapis.com/css?family=Lato&display=swap" rel="stylesheet"/>
            <link media="all" key="font-material-icons" href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/>
            <link rel="icon" href="/favicon.ico" />
            <link rel="apple-touch-icon" href="logo192.png" />
            <meta name="theme-color" content="#000000" />
            <link rel="manifest" href="/manifest.json" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument