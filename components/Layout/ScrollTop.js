// https://material-ui.com/components/app-bar/#back-to-top
import React, { useEffect } from 'react'
import Router from 'next/router'
import { makeStyles } from '@material-ui/core/styles'
import useScrollTrigger from '@material-ui/core/useScrollTrigger'
import Zoom from '@material-ui/core/Zoom'

const useStyles = makeStyles((theme) => ({
    root: {
      position: 'fixed',
      bottom: theme.spacing(2),
      right: theme.spacing(2),
      zIndex: 1000
    }
}))

export default function ScrollTop(props) {
    const { selector = '#back-to-top-anchor', children, window } = props
    const classes = useStyles()

    // Note that you normally won't need to set the window ref as useScrollTrigger
    // will default to window.
    // This is only being set here because the demo is in an iframe.
    const trigger = useScrollTrigger({
      target: window ? window() : undefined,
      disableHysteresis: true,
      threshold: 100,
    })
  
    const handleClick = (event) => {
      const anchor = (event.target.ownerDocument || document).querySelector(selector)

      if (anchor)
        anchor.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  
    return <Zoom in={trigger}>
      <div onClick={handleClick} role="presentation" className={classes.root}>
        {children}
      </div>
    </Zoom>
}









// export function useScrollTop (elementToScroll)  {
//     useEffect(() => {
//         const handleRouteChange = (/*url*/)=> { 
//             const appNode = document.querySelector(elementToScroll)

//             if (appNode) appNode.scrollTo(0, 0) 
//         }
      
//         Router.events.on('routeChangeComplete', handleRouteChange)
        
//         return () => {
//           Router.events.off('routeChangeComplete', handleRouteChange)
//         }
//     }, [elementToScroll])
// }
