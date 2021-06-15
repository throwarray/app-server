import React, { useCallback } from 'react'
import { useDarkMode } from './mui-theme'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import LogoutIcon from '@material-ui/icons/ExitToApp'
import LoginIcon from '@material-ui/icons/VpnKey'
import LightModeIcon from '@material-ui/icons/Brightness4'
import DarkModeIcon from '@material-ui/icons/Brightness7'
import ArrowLeftIcon from '@material-ui/icons/NavigateBefore'
import ArrowRightIcon from '@material-ui/icons/NavigateNext'

const useHeaderStyles = makeStyles((theme) => ({
    appBar: {
        [theme.breakpoints.up('sm')]: {
            width: ({ drawerWidth })=> `calc(100% - ${drawerWidth}px)`,
            marginLeft: ({ drawerWidth })=> drawerWidth,
        },
    },
    headerTitle: {
        [theme.breakpoints.up('sm')]: { display: 'none' },
    },
    headerSpacer: {
        flex: 1
    },
    headerButton: {
        // margin: '0 0.25em'
    },
    headerHamburger: {
        // marginRight: theme.spacing(2),
        [theme.breakpoints.up('sm')]: { display: 'none' },
    },
    username: {
        marginRight: theme.spacing(2)
    }
}))



export default function AppBarHeader ({ router, token, drawerWidth = 180, user, handleDrawerToggle }) {
    const classes = useHeaderStyles({ drawerWidth })
    const [dark_mode, setDarkMode] = useDarkMode()
    const goBack = useCallback(function () { window.history.back() }, [])
    const goForward = useCallback(function () { window.history.forward() }, [])

    return <AppBar position="fixed" className={classes.appBar} color="default">
        <Toolbar>
        <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            className={classes.headerHamburger}
        >
            <MenuIcon />
        </IconButton>

        {/* <Typography variant="h6" noWrap className={classes.headerTitle}>
            App
        </Typography> */}

        { <>
            <IconButton 
                // size="small"
                title="Previous page"
                color="inherit"
                aria-label="Navigate to the previous page" 
                component="button"
                onClick={goBack}
                className={classes.headerButton}
            >   
                <ArrowLeftIcon/>
            </IconButton>
            <IconButton 
                // size="small"
                title="Next page"
                aria-label="Navigate to the next page" 
                component="button"
                onClick={goForward}
                className={classes.headerButton}
            >   
                <ArrowRightIcon/>
            </IconButton>
        </> }
        <div className={classes.headerSpacer}></div>



        {/* Toggle between light and dark theme */}
        { <IconButton 
            // size="small"
            title="Toggle light/dark theme" 
            aria-label="Toggle light/dark theme" 
            component="button"
            className={classes.headerButton}
            onClick={function () { setDarkMode(dark_mode === 'dark'? 'light' : 'dark') }}
        >
            { dark_mode === 'light'? <LightModeIcon/> : <DarkModeIcon/> }
        </IconButton> || null }

        {/* { user && <Typography className={classes.username}>{ user.nickname }</Typography> || null } */}
        {/* <img style={{ display: 'block' }} referrerPolicy="same-origin" src={user.picture} width="32" height="32" alt=""></img> */}
        {
            user? <>
                <form method="POST" action={'/api/logout?returnTo=' + encodeURIComponent(router.pathname)}>
                    <input name="_csrf" type="hidden" defaultValue={token}/>
                    <IconButton 
                        type="submit"
                        // size="small"
                        title="Logout"
                        aria-label="Logout"
                        component="button"
                        className={classes.headerButton}
                    >   
                        <LogoutIcon/>
                    </IconButton>
                </form>
            </> : 
            <>
                {/* <div aria-hidden="true"></div>
                <div aria-hidden="true" style={{ width: 32, height: 32 }}></div> */}

                <a href="/api/login" role="link" aria-label="Click to proceed to login" title="Login">
                    <IconButton 
                        // size="small"
                        title="Login"
                        aria-label="Login" 
                        component="button"
                        className={classes.headerButton}
                    >   
                        <LoginIcon/>
                    </IconButton>
                </a>
            </>
        }

        </Toolbar>
  </AppBar>
}
