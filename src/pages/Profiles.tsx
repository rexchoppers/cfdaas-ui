import {useEffect, useRef, useState} from "react";
import {
    Alert,
    Box,
    IconButton,
    Menu,
    MenuItem,
    Snackbar,
    SpeedDial,
    SpeedDialAction,
    SpeedDialIcon,
    Typography,
} from "@mui/material";
import {DataGrid, GridColDef} from "@mui/x-data-grid";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import {useAuth} from "react-oidc-context";
import {useCompany} from "../context/CompanyContext.tsx";
import {authRequest} from "../utils/AuthenticatedRequestUtil.ts";
import * as R from "remeda";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Profile {
    id: string;
    name: string;
    platform: string;
    credentialType: string;
    description?: string;
    createdBy: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        active: boolean;
        createdAt: string;
        updatedAt: string;
    } | null;
    createdAt: string;
    updatedAt: string;
}

export default function ProfilesPage() {
    const auth = useAuth();
    const company = useCompany();

    // States
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [menuAnchor, setMenuAnchor] = useState<{ [key: number]: HTMLElement | null }>({});
    const [toast, setToast] = useState({open: false, message: "", severity: "success"});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const hasFetchedRef = useRef(false);

    // Fetch Profiles
    const fetchProfilesData = () => {
        if (!auth.isAuthenticated || !company.selectedCompany?.id) return;

        setLoading(true);
        setError(null);

        authRequest(auth, `${API_BASE_URL}/company/${company.selectedCompany.id}/profile`)
            .then((res) => {
                if (!res) throw new Error("Failed to fetch profiles data");
                if (!res.ok) throw new Error(`Failed to load profiles data: ${res.statusText}`);
                return res.json();
            })
            .then((data: Profile[]) => {
                setProfiles(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        if (!auth.isAuthenticated || !company.selectedCompany?.id) return;

        if (hasFetchedRef.current) return;
        hasFetchedRef.current = true;

        fetchProfilesData();
    }, [auth.isAuthenticated, company.selectedCompany?.id]);

    const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, id: number) => {
        setMenuAnchor({...menuAnchor, [id]: event.currentTarget});
    };

    const handleCloseMenu = (id: number) => {
        setMenuAnchor({...menuAnchor, [id]: null});
    };

    const columns: GridColDef[] = [
        {field: "name", headerName: "Name", flex: 1},
        {field: "platform", headerName: "Platform", flex: 1},
        {field: "credentialType", headerName: "Credential Type", flex: 1},
        {field: "description", headerName: "Description", flex: 1},
        {
            field: "createdBy",
            headerName: "Created By",
            flex: 1,
            valueGetter: (createdBy: any) => {
                return createdBy ? `${createdBy.firstName} ${createdBy.lastName}` : '-';
            }
        },
        {
            field: "createdAt",
            headerName: "Created At",
            flex: 1,
            valueFormatter: (value: string) => {
                return new Date(value).toLocaleString();
            }
        },
        {
            field: "updatedAt",
            headerName: "Updated At",
            flex: 1,
            valueFormatter: (value: string) => {
                return new Date(value).toLocaleString();
            }
        },
        {
            field: "actions",
            headerName: "Actions",
            sortable: false,
            renderCell: (params) => (
                <>
                    <IconButton onClick={(e) => handleOpenMenu(e, params.id as number)}>
                        <MoreVertIcon/>
                    </IconButton>
                    <Menu
                        anchorEl={menuAnchor[params.id as number]}
                        open={Boolean(menuAnchor[params.id as number])}
                        onClose={() => handleCloseMenu(params.id as number)}
                    >
                        <MenuItem onClick={() => {
                            // TODO: Implement edit profile functionality
                            handleCloseMenu(params.id as number);
                        }}>
                            <EditIcon sx={{mr: 1}}/> Edit
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                // TODO: Implement delete profile functionality
                                handleCloseMenu(params.id as number);
                            }}
                            sx={{color: "red"}}>
                            <DeleteIcon sx={{mr: 1}}/> Delete
                        </MenuItem>
                    </Menu>
                </>
            ),
            flex: 0.3
        }
    ];

    const handleCloseToast = () => {
        setToast({open: false, message: "", severity: "success"});
    };

    return (
        <Box sx={{p: 3, position: "relative"}}>
            {/* Header */}
            <Typography variant="h4" gutterBottom>
                Cloud Provider Profiles
            </Typography>

            {/* Profiles Data Grid */}
            <DataGrid
                rows={profiles}
                columns={columns}
                autoHeight
                loading={loading}
            />

            {/* Floating Action Button (SpeedDial) */}
            <SpeedDial
                ariaLabel="Profile Actions"
                sx={{position: "fixed", bottom: 16, right: 16}}
                icon={<SpeedDialIcon/>}
            >
                <SpeedDialAction
                    key="Add Profile"
                    icon={<AddIcon/>}
                    tooltipTitle="Add Profile"
                    onClick={() => {
                        // TODO: Implement add profile functionality
                    }}
                />
            </SpeedDial>

            {/* Toast Notification */}
            <Snackbar
                open={toast.open}
                autoHideDuration={6000}
                onClose={handleCloseToast}
                anchorOrigin={{vertical: "bottom", horizontal: "right"}}
            >
                <Alert onClose={handleCloseToast} severity={toast.severity as any}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
