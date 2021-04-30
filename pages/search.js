import Head from 'next/head'

function Button ({ children }) {
    const theme = {
        background: 'black',
        color: 'white'
    }//useContext(ThemeContext)
    
    return <button>
        <style jsx>{`
            button {
                background: ${theme.background};
                color: ${theme.foreground};
            }
        `}</style>
        { children }
    </button>
}


export default function SearchPage () {
    return <div>
        <Head>
            <title key="page-title">Search | App</title>
            <meta key="page-description" name="Description" content="Search | App"/>
        </Head>

        <Button>Search</Button>
    </div>
}