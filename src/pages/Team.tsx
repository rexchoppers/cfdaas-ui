import {useEffect, useState} from "react";
import {
    Alert,
    Box,
    IconButton,
    Menu,
    MenuItem, Snackbar,
    SpeedDial,
    SpeedDialAction,
    SpeedDialIcon,
    Typography
} from "@mui/material";
import { DataGrid, GridColDef, GridRowEditStopReasons } from "@mui/x-data-grid";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import AddMemberModal from "../components/AddMemberModal";
import {Access} from "../types/Access.ts";
import {useAuth} from "react-oidc-context";
import {useCompany} from "../context/CompanyContext.tsx";
import {authRequest} from "../utils/AuthenticatedRequestUtil.ts"; // Import the new modal component

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function TeamPage() {
    const auth = useAuth();
    const company = useCompany();

    // States
    const [team, setTeam] = useState<Access[]>([]);
    const [menuAnchor, setMenuAnchor] = useState<{ [key: number]: HTMLElement | null }>({});
    const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log(company.selectedCompany);

        if (!auth.isAuthenticated || !company.selectedCompany?.id) return;

        setLoading(true);
        setError(null);

        authRequest(auth, `${API_BASE_URL}/company/${company.selectedCompany.id}/team`)
            .then((res) => {
                if (!res) throw new Error("Failed to fetch team data");
                if (!res.ok) throw new Error(`Failed to load team data: ${res.statusText}`);
                return res.json();
            })
            .then((data: Access[]) => {
                setTeam(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [auth.user, company.selectedCompany]);



    const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, id: number) => {
        setMenuAnchor({ ...menuAnchor, [id]: event.currentTarget });
    };

    const handleCloseMenu = (id: number) => {
        setMenuAnchor({ ...menuAnchor, [id]: null });
    };

    const handleDelete = (id: number) => {
        setTeam((prev) => prev.filter((member) => member.id !== id));
    };

    const columns: GridColDef[] = [
        { field: "name", headerName: "Name", flex: 1, editable: true },
        { field: "role", headerName: "Role", flex: 1, editable: true },
        { field: "email", headerName: "Email", flex: 1 },
        {
            field: "actions",
            headerName: "Actions",
            sortable: false,
            renderCell: (params) => (
                <>
                    <IconButton onClick={(e) => handleOpenMenu(e, params.id as number)}>
                        <MoreVertIcon />
                    </IconButton>
                    <Menu
                        anchorEl={menuAnchor[params.id as number]}
                        open={Boolean(menuAnchor[params.id as number])}
                        onClose={() => handleCloseMenu(params.id as number)}
                    >
                        <MenuItem onClick={() => alert(`Editing ${params.row.name}`)}>
                            <EditIcon sx={{ mr: 1 }} /> Edit
                        </MenuItem>
                        <MenuItem onClick={() => handleDelete(params.id as number)} sx={{ color: "red" }}>
                            <DeleteIcon sx={{ mr: 1 }} /> Delete
                        </MenuItem>
                    </Menu>
                </>
            ),
            flex: 0.3
        }
    ];

    // ✅ STATE FOR ADDING A USER

    const handleAddMember = (access: Access) => {
        // setTeam((prev) => [...prev, newMember]);

        setToast({ open: true, message: "Member added successfully", severity: "success" });
    };

    const handleCloseToast = () => {
        setToast({ open: false, message: "", severity: "success" });
    };

    // ✅ FAB MENU ACTIONS
    const actions = [
        { icon: <AddIcon />, name: "Add User", onClick: () => setIsAddMemberOpen(true) },
    ];

    return (
        <Box sx={{ p: 3, position: "relative" }}>
            {/* Header */}
            <Typography variant="h4" gutterBottom>
                Team Management
            </Typography>

            {/* Team Data Grid */}
            <DataGrid
                rows={team}
                columns={columns}
                autoHeight
                // disableSelectionOnClick
                processRowUpdate={(params) =>
                    setTeam((prev) =>
                        prev.map((member) =>
                            member.id === params.id ? { ...member, [params.field]: params.value } : member
                        )
                    )
                }
                onRowEditStop={(params, event) => {
                    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
                        event.defaultMuiPrevented = true;
                    }
                }}
            />

            {/* Floating Action Button (SpeedDial) */}
            <SpeedDial
                ariaLabel="Team Actions"
                sx={{ position: "fixed", bottom: 16, right: 16 }}
                icon={<SpeedDialIcon />}
            >
                {actions.map((action) => (
                    <SpeedDialAction
                        key={action.name}
                        icon={action.icon}
                        tooltipTitle={action.name}
                        onClick={action.onClick}
                    />
                ))}
            </SpeedDial>

            {/* Add Member Modal (Now a Separate Component) */}
            <AddMemberModal
                open={isAddMemberOpen}
                onClose={() => setIsAddMemberOpen(false)}
            />

            {/* ✅ Success Snackbar */}
            <Snackbar open={toast.open} autoHideDuration={4000} onClose={handleCloseToast}>
                <Alert onClose={handleCloseToast} severity={toast.severity as any} sx={{ width: '100%' }}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
