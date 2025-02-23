import {useEffect, useState} from 'react'
import './App.css'
import {
    AppBar,
    Box,
    CssBaseline,
    Divider,
    Drawer,
    IconButton, Theme,
    Toolbar,
    Typography, useMediaQuery
} from "@mui/material";
import {Routes} from "react-router-dom";

const drawerWidth = 240;

function App() {
    const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
    // @ts-ignore
    const [open, setOpen] = useState<boolean>(!isMobile);

    // const [count, setCount] = useState(0)

    const toggleDrawer = () => {
        setOpen(!open);
    }

    useEffect(() => {
        setOpen(!isMobile);
    }, [isMobile]);

    return (
        <Box sx={{display: "flex"}}>
            <CssBaseline/>

            {/* Top App Bar */}
            <AppBar position="fixed" sx={{zIndex: (theme) => theme.zIndex.drawer + 1}}>
                <Toolbar>
                    <IconButton color="inherit" edge="start" onClick={toggleDrawer} sx={{mr: 2}}>
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
                <Toolbar/>
                <Divider/>
                {/*    <List>
                    {[
                        { text: "Dashboard", icon: <DashboardIcon /> },
                        { text: "Settings", icon: <SettingsIcon /> },
                        { text: "Logout", icon: <LogoutIcon /> },
                    ].map((item) => (
                        <ListItem button key={item.text}>
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItem>
                    ))}
                </List>*/}
            </Drawer>

            {/* Main Content */}
            <Box component="main" sx={{flexGrow: 1, p: 3, mt: 8}}>
                <Routes>
                    {/*<Route path="/" element={<Dashboard />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/profile" element={<Profile />} />*/}
                </Routes>
            </Box>
        </Box>
    );
}

export default App
