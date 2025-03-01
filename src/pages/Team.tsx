import {Box, Button, Card, CardContent, Grid, IconButton, TextField, Typography} from "@mui/material";
import {useState} from "react";
import {DataGrid, GridColDef, GridRowEditStopReasons} from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

export default function TeamPage() {
    // Sample Team Data
    const [team, setTeam] = useState([
        { id: 1, name: "Alice Johnson", role: "Admin", email: "alice@example.com" },
        { id: 2, name: "Bob Smith", role: "Editor", email: "bob@example.com" },
        { id: 3, name: "Charlie Davis", role: "Viewer", email: "charlie@example.com" }
    ]);

    // Handle Edit
    const handleEditCellChange = (params: any) => {
        setTeam((prev) =>
            prev.map((member) =>
                member.id === params.id ? { ...member, [params.field]: params.value } : member
            )
        );
    };

    // Handle Delete
    const handleDelete = (id: number) => {
        setTeam((prev) => prev.filter((member) => member.id !== id));
    };

    // Handle Add New Member
    const [newMember, setNewMember] = useState({ name: "", role: "", email: "" });

    const handleAddMember = () => {
        if (!newMember.name || !newMember.role || !newMember.email) return;
        setTeam((prev) => [...prev, { id: Date.now(), ...newMember }]);
        setNewMember({ name: "", role: "", email: "" }); // Reset fields
    };

    // Define Table Columns
    const columns: GridColDef[] = [
        { field: "name", headerName: "Name", flex: 1, editable: true },
        { field: "role", headerName: "Role", flex: 1, editable: true },
        { field: "email", headerName: "Email", flex: 1 },
        {
            field: "actions",
            headerName: "Actions",
            sortable: false,
            renderCell: (params) => (
                <IconButton color="error" onClick={() => handleDelete(params.id as number)}>
                    <DeleteIcon />
                </IconButton>
            ),
            flex: 0.3
        }
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Team Management
            </Typography>

            {/* Add New Member Form - Inside a Card */}
            <Card sx={{ mb: 3, p: 2 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Add New Member
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                label="Name"
                                value={newMember.name}
                                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                label="Role"
                                value={newMember.role}
                                onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                label="Email"
                                value={newMember.email}
                                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<PersonAddIcon />}
                                fullWidth
                                onClick={handleAddMember}
                            >
                                Add Member
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Team Data Grid */}
            <DataGrid
                rows={team}
                columns={columns}
                autoHeight
                // disableSelectionOnClick
                processRowUpdate={handleEditCellChange}
                onRowEditStop={(params, event) => {
                    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
                        event.defaultMuiPrevented = true;
                    }
                }}
            />
        </Box>
    );
}
