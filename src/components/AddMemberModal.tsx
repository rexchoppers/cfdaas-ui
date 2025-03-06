import { useState, useEffect } from "react";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Button,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    CircularProgress
} from "@mui/material";

// Define the props for the modal
interface AddMemberModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (member: { firstName: string; lastName: string; email: string; password: string; role: string }) => void;
}

// Define the type for access levels
type AccessLevel = "owner" | "admin" | "editor" | "viewer";

export default function AddMemberModal({ open, onClose, onSubmit }: AddMemberModalProps) {
    const [newMember, setNewMember] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: ""
    });

    const [accessLevels, setAccessLevels] = useState<AccessLevel[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // ✅ Fetch access levels when modal opens
    useEffect(() => {
        if (open) {
            setLoading(true);
            fetch("/api/access-levels") // Replace with your actual API endpoint
                .then((res) => res.json())
                .then((data) => {
                    setAccessLevels(data); // Assume API returns ["owner", "admin", "editor", "viewer"]
                    setLoading(false);
                })
                .catch(() => {
                    setAccessLevels([]); // Handle error gracefully
                    setLoading(false);
                });
        }
    }, [open]);

    const handleSubmit = () => {
        if (!newMember.firstName || !newMember.lastName || !newMember.email || !newMember.password || !newMember.role) {
            return;
        }
        onSubmit(newMember);
        setNewMember({ firstName: "", lastName: "", email: "", password: "", role: "" }); // Reset fields
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ pb: 2 }}>Add New Member</DialogTitle>
            <DialogContent sx={{ overflow: "visible", pt: 1, pb: 3 }}>
                <Grid container spacing={2}>
                    {/* First Name & Last Name (Side by Side) */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="First Name"
                            value={newMember.firstName}
                            onChange={(e) => setNewMember({ ...newMember, firstName: e.target.value })}
                            helperText="Enter the first name"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Last Name"
                            value={newMember.lastName}
                            onChange={(e) => setNewMember({ ...newMember, lastName: e.target.value })}
                            helperText="Enter the last name"
                        />
                    </Grid>

                    {/* Email */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={newMember.email}
                            onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                            helperText="Provide a valid email address"
                        />
                    </Grid>

                    {/* Password */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            value={newMember.password}
                            onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                            helperText="Enter a secure password"
                        />
                    </Grid>

                    {/* Role Dropdown */}
                    <Grid item xs={12}>
                        {loading ? (
                            <CircularProgress size={24} />
                        ) : (
                            <FormControl fullWidth>
                                <InputLabel>Role</InputLabel>
                                <Select
                                    value={newMember.role}
                                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                                >
                                    {accessLevels.map((level) => (
                                        <MenuItem key={level} value={level}>
                                            {level.charAt(0).toUpperCase() + level.slice(1)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2, justifyContent: "space-between" }}>
                <Button onClick={onClose} color="secondary">Cancel</Button>
                <Button variant="contained" onClick={handleSubmit}>Add</Button>
            </DialogActions>
        </Dialog>
    );
}
