import { useEffect, useState } from 'react';
import './App.css';
import {
    AppBar,
    Box,
    CssBaseline,
    Divider,
    Drawer,
    IconButton,
    Theme,
    Toolbar,
    Typography,
    useMediaQuery
} from "@mui/material";
import { useAuth } from "react-oidc-context";

const drawerWidth = 240;

function App() {
    const auth = useAuth();
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
        if (!auth.isAuthenticated && !auth.isLoading) {
            auth.signinRedirect();
        }
    }, [auth.isAuthenticated, auth.isLoading]);

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
                {/* Sidebar Menu */}
            </Drawer>

            {/* Main Content */}
            <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
                {/* Routes and Page Content */}
            </Box>
        </Box>
    );
}

export default App;
