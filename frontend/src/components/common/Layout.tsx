import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Add as AddIcon,
  ViewList as ViewListIcon,
  AccountCircle as AccountCircleIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

interface NavigationItem {
  text: string;
  path: string;
  icon: React.ReactNode;
}

const drawerWidth = 240;

const navigationItems: NavigationItem[] = [
  {
    text: 'Dashboard',
    path: '/',
    icon: <DashboardIcon />
  },
  {
    text: 'Social Accounts',
    path: '/social-accounts',
    icon: <ShareIcon />
  },
  {
    text: 'New Post',
    path: '/posts/create',
    icon: <AddIcon />
  },
  {
    text: 'Posts',
    path: '/posts',
    icon: <ViewListIcon />
  },
  {
    text: 'Profile',
    path: '/profile',
    icon: <PersonIcon />
  }
];

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = async () => {
    handleUserMenuClose();
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Schedulify
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={isActive}
                onClick={() => {
                  if (isMobile) {
                    setMobileOpen(false);
                  }
                }}
              >
                <ListItemIcon sx={{ color: isActive ? 'primary.main' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {navigationItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
          </Typography>
          
          {user && (
            <>
              <IconButton
                size="large"
                edge="end"
                color="inherit"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleUserMenuOpen}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                  {user.firstName.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={userMenuAnchor}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(userMenuAnchor)}
                onClose={handleUserMenuClose}
              >
                <MenuItem component={Link} to="/profile" onClick={handleUserMenuClose}>
                  <ListItemIcon>
                    <AccountCircleIcon fontSize="small" />
                  </ListItemIcon>
                  <Typography variant="inherit">Profile</Typography>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <Typography variant="inherit">Logout</Typography>
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="navigation menu"
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          marginTop: '64px', // AppBar height
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 