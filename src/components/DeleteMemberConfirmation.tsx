import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography } from "@mui/material";

interface DeleteMemberConfirmationProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    name: string;
}

export default function DeleteMemberConfirmation({
                                                     open,
                                                     onClose,
                                                     onConfirm,
                                                     name
                                                 }: DeleteMemberConfirmationProps) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
                <Typography variant="body1">
                    Are you sure you want to remove <strong>{name}</strong> from the team?
                </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2, display: "flex", justifyContent: "flex-end", gap: 2 }}>
                <Button onClick={onClose} variant="contained" color="inherit">
                    Cancel
                </Button>
                <Button onClick={onConfirm} variant="contained" color="error">
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
}
