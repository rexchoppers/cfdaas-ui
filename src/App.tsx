import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {
    AppBar,
    Box,
    CssBaseline,
    Divider,
    Drawer,
    IconButton,
    Toolbar,
    Typography
} from "@mui/material";

const drawerWidth = 240;

function App() {
    // @ts-ignore
    const [open, setOpen] = useState<boolean>(true);

  const [count, setCount] = useState(0)

    const toggleDrawer = () => {
      console.log('toggleDrawer')
    }

    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />

            {/* Top App Bar */}
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <IconButton color="inherit" edge="start" onClick={toggleDrawer} sx={{ mr: 2 }}>
                        {/*<MenuIcon />*/}
                    </IconButton>
                    <Typography variant="h6" noWrap>
                        My Dashboard
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* Sidebar (Drawer) */}
            <Drawer
                variant="permanent"
                open={open}
                sx={{
                    width: open ? drawerWidth : 60,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": {
                        width: open ? drawerWidth : 60,
                        transition: "width 0.3s",
                        overflowX: "hidden",
                    },
                }}
            >
                <Toolbar />
                <Divider />

            </Drawer>

            {/* Main Content */}
            <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
                {/* Vite + React content inside dashboard */}
                <Box display="flex" justifyContent="center" gap={2}>
                    <a href="https://vite.dev" target="_blank">
                        <img src={viteLogo} className="logo" alt="Vite logo" />
                    </a>
                    <a href="https://react.dev" target="_blank">
                        <img src={reactLogo} className="logo react" alt="React logo" />
                    </a>
                </Box>
                <Typography variant="h4" textAlign="center" mt={2}>
                    Vite + React
                </Typography>
                <Box textAlign="center" mt={3}>
                    <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
                    <Typography variant="body1">
                        Edit <code>src/App.tsx</code> and save to test HMR.
                    </Typography>
                </Box>
                <Typography variant="body2" textAlign="center" mt={2}>
                    Click on the Vite and React logos to learn more.
                </Typography>
            </Box>
        </Box>
    );
}

export default App
