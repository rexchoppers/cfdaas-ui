import { useState } from "react";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Button,
    TextField
} from "@mui/material";

interface AddMemberModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (member: { name: string; role: string; email: string }) => void;
}

export default function AddMemberModal({ open, onClose, onSubmit }: AddMemberModalProps) {
    const [newMember, setNewMember] = useState({ name: "", role: "", email: "" });

    const handleSubmit = () => {
        if (!newMember.name || !newMember.role || !newMember.email) return;
        onSubmit(newMember);
        setNewMember({ name: "", role: "", email: "" }); // Reset fields
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Add New Member</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Name"
                            value={newMember.name}
                            onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Role"
                            value={newMember.role}
                            onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Email"
                            value={newMember.email}
                            onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit}>
                    Add
                </Button>
            </DialogActions>
        </Dialog>
    );
}
