import {useEffect, useState} from "react";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Button,
    TextField,
    MenuItem,
    CircularProgress
} from "@mui/material";
import {Formik, Form} from "formik";
import * as Yup from "yup";
import {useAuth} from "react-oidc-context";

// Define the type for access levels
type AccessLevel = "owner" | "admin" | "editor" | "viewer";

// Define the props for the modal
interface AddMemberModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (member: { firstName: string; lastName: string; email: string; password: string; role: string }) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


// **Validation Schema using Yup**
const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    role: Yup.string().required("Role is required"),
});

export default function AddMemberModal({open, onClose, onSubmit}: AddMemberModalProps) {
    const auth = useAuth();
    const [accessLevels, setAccessLevels] = useState<AccessLevel[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // ✅ Fetch access levels when modal opens
    useEffect(() => {
        if (open) {
            setLoading(true);
            fetch(`${API_BASE_URL}/access/level`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${auth.user?.access_token}`,
                    "Content-Type": "application/json",
                },
            })
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

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{pb: 2}}>Add New Member</DialogTitle>
            <DialogContent sx={{overflow: "visible", pt: 1, pb: 3}}>
                <Formik
                    initialValues={{
                        firstName: "",
                        lastName: "",
                        email: "",
                        password: "",
                        role: "",
                    }}
                    validationSchema={validationSchema}
                    onSubmit={(values) => {
                        onSubmit(values);
                        onClose();
                    }}
                >
                    {({values, handleChange, handleBlur, errors, touched}) => (
                        <Form>
                            <Grid container spacing={2}>
                                {/* First Name & Last Name */}
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

                                {/* Email */}
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

                                {/* Password */}
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

                                {/* Role Dropdown (Fixed) */}
                                <Grid item xs={12}>
                                    {loading ? (
                                        <CircularProgress size={24} />
                                    ) : (
                                        <TextField
                                            select
                                            fullWidth
                                            size="small"
                                            label="Role"
                                            name="role"
                                            value={values.role}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.role && Boolean(errors.role)}
                                            helperText={touched.role && errors.role}
                                        >
                                            <MenuItem disabled value="">Select a role</MenuItem>
                                            {accessLevels.map((level) => (
                                                <MenuItem key={level} value={level}>
                                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    )}
                                </Grid>
                            </Grid>

                            <DialogActions sx={{  pt: 2, px: 0, display: "flex", justifyContent: "flex-end", gap: 2 }}>
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
