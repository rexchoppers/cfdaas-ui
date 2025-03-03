import {useState} from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    Menu,
    MenuItem, SpeedDial, SpeedDialAction, SpeedDialIcon,
    TextField,
    Typography
} from "@mui/material";
import {DataGrid, GridColDef, GridRowEditStopReasons} from "@mui/x-data-grid";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";

export default function TeamPage() {
    const [team, setTeam] = useState([
        {id: 1, name: "Alice Johnson", role: "Admin", email: "alice@example.com"},
        {id: 2, name: "Bob Smith", role: "Editor", email: "bob@example.com"},
        {id: 3, name: "Charlie Davis", role: "Viewer", email: "charlie@example.com"}
    ]);

    const [menuAnchor, setMenuAnchor] = useState<{ [key: number]: HTMLElement | null }>({});

    const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, id: number) => {
        setMenuAnchor({...menuAnchor, [id]: event.currentTarget});
    };

    const handleCloseMenu = (id: number) => {
        setMenuAnchor({...menuAnchor, [id]: null});
    };

    const handleDelete = (id: number) => {
        setTeam((prev) => prev.filter((member) => member.id !== id));
    };

    const columns: GridColDef[] = [
        {field: "name", headerName: "Name", flex: 1, editable: true},
        {field: "role", headerName: "Role", flex: 1, editable: true},
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
                        <MenuItem onClick={() => alert(`Editing ${params.row.name}`)}>
                            <EditIcon sx={{mr: 1}}/> Edit
                        </MenuItem>
                        <MenuItem onClick={() => handleDelete(params.id as number)} sx={{color: "red"}}>
                            <DeleteIcon sx={{mr: 1}}/> Delete
                        </MenuItem>
                    </Menu>
                </>
            ),
            flex: 0.3
        }
    ];

    // ✅ MODAL STATE FOR ADDING A USER
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newMember, setNewMember] = useState({name: "", role: "", email: ""});

    const handleAddMember = () => {
        if (!newMember.name || !newMember.role || !newMember.email) return;
        setTeam((prev) => [...prev, {id: Date.now(), ...newMember}]);
        setNewMember({name: "", role: "", email: ""}); // Reset fields
        setIsAddOpen(false);
    };

    // ✅ FAB MENU ACTIONS
    const actions = [
        {icon: <AddIcon/>, name: "Add User", onClick: () => setIsAddOpen(true)},
    ];

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
                // disableSelectionOnClick
                processRowUpdate={(params) =>
                    setTeam((prev) =>
                        prev.map((member) =>
                            member.id === params.id ? {...member, [params.field]: params.value} : member
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
                sx={{position: "fixed", bottom: 16, right: 16}}
                icon={<SpeedDialIcon/>}
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

            {/* Add Member Dialog (Modal) */}
            <Dialog open={isAddOpen} onClose={() => setIsAddOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Add New Member</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{mt: 1}}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Name"
                                value={newMember.name}
                                onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Role"
                                value={newMember.role}
                                onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Email"
                                value={newMember.email}
                                onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsAddOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleAddMember}>
                        Add
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
