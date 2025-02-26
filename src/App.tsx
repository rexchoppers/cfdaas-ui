import { useEffect, useState } from 'react';
import {
    AppBar,
    Box,
    CssBaseline,
    Divider,
    Drawer,
    IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    Theme,
    Toolbar,
    Typography,
    useMediaQuery
} from "@mui/material";
import {hasAuthParams, useAuth} from "react-oidc-context";
import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import {Link} from "react-router-dom";

const drawerWidth = 240;

const pages = [
    { text: "Home", icon: <HomeIcon />, path: "/" },
    { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
    { text: "Logout", icon: <LogoutIcon />, path: "/logout" },
];

function App() {
    const auth = useAuth();
    const [hasTriedSignin, setHasTriedSignin] = useState(false);

    const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

    // @ts-ignore
    const [open, setOpen] = useState<boolean>(!isMobile);

    const toggleDrawer = () => {
        setOpen(!open);
    };

    useEffect(() => {
        setOpen(!isMobile);
    }, [isMobile]);

    // Auto redirect to sign-in if not authenticated
    useEffect(() => {
        if (!hasAuthParams() &&
            !auth.isAuthenticated && !auth.activeNavigator && !auth.isLoading &&
            !hasTriedSignin
        ) {
            auth.signinRedirect();
            setHasTriedSignin(true);
        }
    }, [auth, hasTriedSignin]);

    if (auth.isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />

            {/* Top App Bar */}
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <IconButton color="inherit" edge="start" onClick={toggleDrawer} sx={{ mr: 2 }}>
                        {/*<MenuIcon/>*/}
                    </IconButton>
                    <Typography variant="h6" noWrap>
                        CFDAAS
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* Sidebar (Drawer) - Responsive */}
            <Drawer
                variant={isMobile ? "temporary" : "permanent"}
                open={open}
                onClose={toggleDrawer}
                sx={{
                    width: isMobile ? 0 : drawerWidth,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": {
                        width: drawerWidth,
                        transition: "width 0.3s",
                        overflowX: "hidden",
                    },
                }}
            >
                <Toolbar />
                <Divider />

                <List>
                    {pages.map((page, index) => (
                        <ListItem key={index} disablePadding>
                            <ListItemButton component={Link} to={page.path}>
                                <ListItemIcon>{page.icon}</ListItemIcon>
                                <ListItemText primary={page.text} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Drawer>

            {/* Main Content */}
            <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>

            </Box>
        </Box>
    );
}

export default App;
