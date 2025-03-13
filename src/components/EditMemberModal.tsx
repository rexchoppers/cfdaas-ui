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
    CircularProgress,
    Alert
} from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useAuth } from "react-oidc-context";
import { useCompany } from "../context/CompanyContext.tsx";
import { Access } from "../types/Access.ts";
import {User} from "../types/User.ts";

type AccessLevel = "owner" | "admin" | "editor" | "viewer";

interface EditMemberModalProps {
    open: boolean;
    onClose: (updatedAccess?: Access) => void;
    member: Access;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    level: Yup.string().required("Role is required"),
});

export default function EditMemberModal({ open, onClose, member }: EditMemberModalProps) {
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

    const handleSubmit = async (values: {
        firstName: string;
        lastName: string;
        email: string;
        level: string;
    }) => {
        if (!member) return;

        try {
            const response = await fetch(`${API_BASE_URL}/company/${company.selectedCompany.id}/team/${member.id}`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${auth.user?.id_token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                throw new Error((await response.json()).message);
            }

            const updatedMember: Access = await response.json();
            onClose(updatedMember);
        } catch (error) {
            // @ts-ignore
            setApiError(error.message || "An unexpected error occurred");
        }
    };

    return (
        <Dialog open={open} onClose={() => onClose()} fullWidth maxWidth="sm">
            <DialogTitle sx={{ pb: 2 }}>Edit Member</DialogTitle>
            <DialogContent sx={{ overflow: "visible", pt: 1, pb: 3 }}>
                {/* ✅ Error Message Display */}
                {apiError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {apiError}
                    </Alert>
                )}

                <Formik
                    initialValues={{
                        firstName: (member?.user as User).firstName || "",
                        lastName: (member?.user as User).lastName || "",
                        email: (member?.user as User).email || "",
                        level: member.level || "",
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
                                        disabled // Prevent email change
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
                                <Button onClick={() => onClose()} variant="contained" color="inherit">
                                    Cancel
                                </Button>
                                <Button type="submit" variant="contained">
                                    Save
                                </Button>
                            </DialogActions>
                        </Form>
                    )}
                </Formik>
            </DialogContent>
        </Dialog>
    );
}
