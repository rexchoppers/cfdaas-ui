import {useEffect, useState} from "react";
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
import AddMemberModal from "../components/AddMemberModal";
import {Access} from "../types/Access.ts";
import {useAuth} from "react-oidc-context";
import {useCompany} from "../context/CompanyContext.tsx";
import {authRequest} from "../utils/AuthenticatedRequestUtil.ts";
import {User} from "../types/User.ts";
import DeleteMemberConfirmation from "../components/DeleteMemberConfirmation.tsx";
import * as R from "remeda";
import EditMemberModal from "../components/EditMemberModal.tsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function TeamPage() {
    const auth = useAuth();
    const company = useCompany();

    // States
    const [team, setTeam] = useState<{
        id: string;
        userId: string;
        name: string;
        role: string;
        email: string;
    }[]>([]);
    const [menuAnchor, setMenuAnchor] = useState<{ [key: number]: HTMLElement | null }>({});
    const [toast, setToast] = useState({open: false, message: "", severity: "success"});
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [deleteMemberConfirmationDialogOpen, setDeleteMemberConfirmationDialogOpen] = useState(false);
    const [deleteMemberTarget, setDeleteMemberTarget] = useState<{ id: string, name: string } | null>(null);

    const [isEditMemberOpen, setIsEditMemberOpen] = useState(false);
    const [editMemberTarget, setEditMemberTarget] = useState<{ userId: string} | null>(null);


    // ✅ FETCH TEAM MEMBERS
    const fetchTeamData = () => {
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
                const formattedData = data.map((access) => {
                    const user = access.user as User;
                    return {
                        id: access.id,
                        userId: user.id,
                        name: `${user.firstName} ${user.lastName}`,
                        role: R.capitalize(access.level),
                        email: user.email,
                    };
                });

                setTeam(formattedData);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchTeamData();
    }, [auth.user, company.selectedCompany]);

    // ✅ DELETE HANDLER WITH CONFIRMATION
    const handleDeleteMemberConfirm = async () => {
        if (!deleteMemberTarget) return;

        try {
            const res = await authRequest(auth, `${API_BASE_URL}/company/${company.selectedCompany.id}/team/${deleteMemberTarget.id}`, "DELETE");

            if (!res) {
                throw new Error("No response from server");
            }

            if (!res.ok) {
                const errorData = await res.json().catch(() => null); // Handle cases where response is not JSON
                throw new Error(errorData?.message || `Failed to delete member (Status: ${res.status})`);
            }

            setToast({open: true, message: "Member deleted successfully", severity: "success"});
            fetchTeamData();
        } catch (err: any) {
            setToast({open: true, message: err.message, severity: "error"});
        } finally {
            setDeleteMemberConfirmationDialogOpen(false);
            setDeleteMemberTarget(null);
        }
    };

    const handleEditMember = (member: { userId: string }) => {
        setEditMemberTarget(member);
        console.log(member);
        setIsEditMemberOpen(true);
    };

    const handleOpenDeleteMemberDialog = (id: string, name: string) => {
        setDeleteMemberTarget({id, name});
        setDeleteMemberConfirmationDialogOpen(true);
    };

    const handleCloseDeleteMemberDialog = () => {
        setDeleteMemberConfirmationDialogOpen(false);
        setDeleteMemberTarget(null);
    };

    const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, id: number) => {
        setMenuAnchor({...menuAnchor, [id]: event.currentTarget});
    };

    const handleCloseMenu = (id: number) => {
        setMenuAnchor({...menuAnchor, [id]: null});
    };

    const columns: GridColDef[] = [
        {field: "name", headerName: "Name", flex: 1, editable: false},
        {field: "role", headerName: "Role", flex: 1, editable: false},
        {field: "email", headerName: "Email", flex: 1},
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
                        <MenuItem onClick={() => handleEditMember(params.row)}>
                            <EditIcon sx={{mr: 1}}/> Edit
                        </MenuItem>
                        <MenuItem
                            onClick={() => handleOpenDeleteMemberDialog(params.row.userId as string, params.row.name)}
                            sx={{color: "red"}}>
                            <DeleteIcon sx={{mr: 1}}/> Delete
                        </MenuItem>
                    </Menu>
                </>
            ),
            flex: 0.3
        }
    ];

    const handleAddMember = (success: boolean) => {
        if (success) setToast({open: true, message: "Member added successfully", severity: "success"});
        fetchTeamData();
    };

    const handleCloseToast = () => {
        setToast({open: false, message: "", severity: "success"});
    };

    return (
        <Box sx={{p: 3, position: "relative"}}>
            {/* Header */}
            <Typography variant="h4" gutterBottom>
                Team Management
            </Typography>

            {/* Team Data Grid */}
            <DataGrid
                rows={team}
                columns={columns}
                autoHeight
                loading={loading}
            />

            {/* Floating Action Button (SpeedDial) */}
            <SpeedDial
                ariaLabel="Team Actions"
                sx={{position: "fixed", bottom: 16, right: 16}}
                icon={<SpeedDialIcon/>}
            >
                <SpeedDialAction
                    key="Add User"
                    icon={<AddIcon/>}
                    tooltipTitle="Add User"
                    onClick={() => setIsAddMemberOpen(true)}
                />
            </SpeedDial>

            {/* Add Member Modal */}
            <AddMemberModal
                open={isAddMemberOpen}
                onClose={(access) => {
                    console.log("Access created", access);

                    setIsAddMemberOpen(false);

                    handleAddMember(access !== undefined);
                }}
            />

            {/* Edit Member Modal */}
            <EditMemberModal
                open={isEditMemberOpen}
                onClose={(access) => {
                    console.log("Access updated", access);

                    setIsEditMemberOpen(false);

                    if (access) {
                        setToast({open: true, message: "Member updated successfully", severity: "success"});
                        fetchTeamData();
                    }
                }}
                memberId={editMemberTarget?.userId}
            />


            {/* ✅ Delete Confirmation Dialog */}
            <DeleteMemberConfirmation
                open={deleteMemberConfirmationDialogOpen}
                onClose={handleCloseDeleteMemberDialog}
                onConfirm={handleDeleteMemberConfirm}
                name={deleteMemberTarget?.name || ""}
            />

            {/* ✅ Success/Error Snackbar */}
            <Snackbar open={toast.open} autoHideDuration={4000} onClose={handleCloseToast}>
                <Alert onClose={handleCloseToast} severity={toast.severity as any} sx={{width: '100%'}}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
