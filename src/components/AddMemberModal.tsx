import { useEffect, useState } from "react";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Button,
    TextField,
    MenuItem,
    CircularProgress, Alert
} from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useAuth } from "react-oidc-context";
import {useCompany} from "../context/CompanyContext.tsx";

type AccessLevel = "owner" | "admin" | "editor" | "viewer";

interface AddMemberModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (member: { firstName: string; lastName: string; email: string; password: string; level: string }) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    level: Yup.string().required("Role is required"),
});

export default function AddMemberModal({ open, onClose, onSubmit }: AddMemberModalProps) {
    const auth = useAuth();
    const company = useCompany();
    const [accessLevels, setAccessLevels] = useState<AccessLevel[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [apiError, setApiError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setLoading(true);
            setApiError(null);

            fetch(`${API_BASE_URL}/access/level`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${auth.user?.id_token}`,
                    "Content-Type": "application/json",
                },
            })
                .then((res) => res.json())
                .then((data) => {
                    setAccessLevels(data);
                    setLoading(false);
                })
                .catch(() => {
                    setAccessLevels([]);
                    setLoading(false);
                });
        }
    }, [open]);

    const handleSubmit = async (values: { firstName: string; lastName: string; email: string; password: string; level: string }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/company/${company.selectedCompany.id}/team`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${auth.user?.id_token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                throw new Error("Failed to submit data");
            }

            const result = await response.json();
            onSubmit(result);
            onClose();
        } catch (error) {
            console.error("Error submitting data:", error);
            // @ts-ignore
            setApiError(error.message || "An unexpected error occurred");
        }
    };

    return (
        // @ts-ignore

        <Dialog open={open} onClose={(event, reason) => {
            if (reason !== "backdropClick") {
                onClose();
            }
        }} fullWidth maxWidth="sm" disableEscapeKeyDown>
            <DialogTitle sx={{ pb: 2 }}>Add New Member</DialogTitle>
            <DialogContent sx={{ overflow: "visible", pt: 1, pb: 3 }}>
                {/* ✅ Error Message Display */}
                {apiError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {apiError}
                    </Alert>
                )}

                <Formik
                    initialValues={{
                        firstName: "",
                        lastName: "",
                        email: "",
                        password: "",
                        level: "",
                    }}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ values, handleChange, handleBlur, errors, touched }) => (
                        <Form>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="First Name"
                                        name="firstName"
                                        value={values.firstName}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.firstName && Boolean(errors.firstName)}
                                        helperText={touched.firstName && errors.firstName}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Last Name"
                                        name="lastName"
                                        value={values.lastName}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.lastName && Boolean(errors.lastName)}
                                        helperText={touched.lastName && errors.lastName}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        type="email"
                                        name="email"
                                        value={values.email}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.email && Boolean(errors.email)}
                                        helperText={touched.email && errors.email}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Password"
                                        type="password"
                                        name="password"
                                        value={values.password}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.password && Boolean(errors.password)}
                                        helperText={touched.password && errors.password}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    {loading ? (
                                        <CircularProgress size={24} />
                                    ) : (
                                        <TextField
                                            select
                                            fullWidth
                                            size="small"
                                            label="Role"
                                            name="level"
                                            value={values.level}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.level && Boolean(errors.level)}
                                            helperText={touched.level && errors.level}
                                        >
                                            <MenuItem disabled value="">Select a level</MenuItem>
                                            {accessLevels.map((level) => (
                                                <MenuItem key={level} value={level}>
                                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    )}
                                </Grid>
                            </Grid>
                            <DialogActions sx={{ pt: 2, px: 0, display: "flex", justifyContent: "flex-end", gap: 2 }}>
                                <Button onClick={onClose} variant="contained" color="inherit">
                                    Cancel
                                </Button>
                                <Button type="submit" variant="contained">
                                    Add
                                </Button>
                            </DialogActions>
                        </Form>
                    )}
                </Formik>
            </DialogContent>
        </Dialog>
    );
}
