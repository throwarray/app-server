import React from 'react'
import Divider from '@material-ui/core/Divider'
import Drawer from '@material-ui/core/Drawer'
import Hidden from '@material-ui/core/Hidden'
import List from '@material-ui/core/List'
import Typography from '@material-ui/core/Typography'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import HomeIcon from '@material-ui/icons/Home'
import InfoIcon from '@material-ui/icons/Info'
import LogoutIcon from '@material-ui/icons/ExitToApp'
import LoginIcon from '@material-ui/icons/VpnKey'
import SettingsIcon from '@material-ui/icons/Settings'
import clsx from 'clsx'
import Link from './Link'
import Toolbar from '@material-ui/core/Toolbar'
import { makeStyles } from '@material-ui/core/styles'

const useAsideStyles = makeStyles((theme) => ({
  drawer: {
    [theme.breakpoints.up('sm')]: {
      width: ({ drawerWidth })=> drawerWidth,
      flexShrink: 0
    },
  },
  toolbar: theme.mixins.toolbar, // necessary for content to be below app bar
  drawerPaper: {
    width: ({ drawerWidth })=> drawerWidth,
  },
  drawerList: {},
  drawerListItem: {
    color: theme.palette.text.primary
  },
  brandTitle: {
    width: '100%',
    textAlign: 'center'
  },
}))


export default function AppAside ({ router, user, token, drawerWidth = 180, theme, container, mobileOpen, handleDrawerToggle }) {
    const classes = useAsideStyles({ drawerWidth })

    const drawer = (
        <div>
          {/* <div className={classes.toolbar}>
          </div> */}
          <Toolbar className={classes.toolbar}>
            <Typography className={classes.brandTitle} variant="h6">App</Typography>
          </Toolbar>
          <Divider />
          <List component={"div"} className={classes.drawerList}>
            <ListItem title="Home" button href="/" component={Link} className={classes.drawerListItem}>
                <ListItemIcon><HomeIcon /></ListItemIcon>
                <ListItemText primary={'Home'}/>
            </ListItem>
            <ListItem button href="/about" component={Link} className={classes.drawerListItem}>
                <ListItemIcon><InfoIcon/></ListItemIcon>
                <ListItemText primary={'About'}/>
            </ListItem>
            <ListItem button href="/settings" component={Link} className={classes.drawerListItem}>
                <ListItemIcon><SettingsIcon/></ListItemIcon>
                <ListItemText primary={'Settings'}/>
            </ListItem>
            {user?
              <form method="POST" action={'/api/logout?returnTo=' + encodeURIComponent(router.pathname)}>
                <input name="_csrf" type="hidden" defaultValue={token}/>
                <ListItem type="submit" button className={classes.drawerListItem}>
                    <ListItemIcon><LogoutIcon/></ListItemIcon>
                    <ListItemText primary={'Logout'}/>
                </ListItem>
              </form>:
              <ListItem button href="/api/login" component={Link} className={classes.drawerListItem}>
                <ListItemIcon><LoginIcon/></ListItemIcon>
                <ListItemText primary={'Login'}/>
              </ListItem>
            }
          </List>
          <Divider />
          <List/>
        </div>
      )

      return <nav className={classes.drawer} aria-label="mailbox folders">
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Hidden smUp implementation="css">
          <Drawer
            container={container}
            variant="temporary"
            anchor={theme.direction === 'rtl' ? 'right' : 'left'}
            open={mobileOpen}
            onClose={handleDrawerToggle}
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            {drawer}
          </Drawer>
        </Hidden>
        <Hidden xsDown implementation="css">
          <Drawer
            classes={{
              paper: classes.drawerPaper,
            }}
            variant="permanent"
            open
          >
            {drawer}
          </Drawer>
        </Hidden>
      </nav>
}
