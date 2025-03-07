import {hasAuthParams, useAuth} from "react-oidc-context";
import {useEffect, useState} from "react";
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
import {Link, Outlet} from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CloudSyncIcon from "@mui/icons-material/CloudSync";
import StorageIcon from "@mui/icons-material/Storage";
import ReceiptIcon from "@mui/icons-material/Receipt";
import GroupIcon from "@mui/icons-material/Group";
import {useCompany} from "./context/CompanyContext.tsx";
import {Company} from "./types/Company.ts";
import {authRequest} from "./utils/AuthenticatedRequestUtil.ts";
import {Access} from "./types/Access.ts";
import * as R from "remeda";

const drawerWidth = 240;

const pages = [
    {text: 'Dashboard', icon: <DashboardIcon/>, path: "/"},
    {text: "Processes", icon: <CloudSyncIcon/>, path: "/processes"},
    {text: "Instances", icon: <StorageIcon/>, path: "/instances"},
    {text: "Profiles", icon: <ReceiptIcon/>, path: "/profiles"},
    {text: "Team", icon: <GroupIcon/>, path: "/team"},
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Layout() {
    const auth = useAuth();
    const [hasTriedSignin, setHasTriedSignin] = useState(false);
    const { selectedCompany, setSelectedCompany } = useCompany();
    const [companies, setCompanies] = useState([] as Company[]);

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

    useEffect(() => {
        if (!auth.isAuthenticated) return;

        const fetchCompanies = async () => {
            const response = await authRequest(auth, `${API_BASE_URL}/access`);
            if (response && response.ok) {
                const data: Access[] = await response.json();

                const companies = R.map(data, (access) => access.company);

                setCompanies(companies);
                if (data.length > 0) {
                    setSelectedCompany(companies[0]);
                }
            } else {
                console.error("Failed to fetch companies");
            }
        };

        fetchCompanies();
    }, [auth.user, setSelectedCompany]);

    if (auth.isLoading) {
        return <div>Loading...</div>;
    }

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

                {/* Main Navigation Links */}
                <Box sx={{flexGrow: 1}}>  {/* This ensures it takes all available space */}
                    <List>
                        {pages.map((page, index) => (
                            <ListItem key={index} disablePadding>
                                <ListItemButton component={Link} to={page.path}>
                                    <ListItemIcon>{page.icon}</ListItemIcon>
                                    <ListItemText primary={page.text}/>
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>

                <Divider/>

                {/* Logout Button at Bottom */}
                <List>
                    <ListItem disablePadding>
                        <ListItemButton component={Link} to="/logout">
                            <ListItemIcon><LogoutIcon/></ListItemIcon>
                            <ListItemText primary="Logout"/>
                        </ListItemButton>
                    </ListItem>
                </List>


            </Drawer>


            {/* Main Content */}
            <Box component="main" sx={{flexGrow: 1, p: 3, mt: 8}}>
                <Outlet/>
            </Box>
        </Box>
    );
}
