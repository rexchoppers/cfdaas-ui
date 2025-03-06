import {useEffect, useState} from "react";
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
import {Formik, Form} from "formik";
import * as Yup from "yup";

// Define the type for access levels
type AccessLevel = "owner" | "admin" | "editor" | "viewer";

// Define the props for the modal
interface AddMemberModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (member: { firstName: string; lastName: string; email: string; password: string; role: string }) => void;
}

// **Validation Schema using Yup**
const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    role: Yup.string().required("Role is required"),
});

export default function AddMemberModal({open, onClose, onSubmit}: AddMemberModalProps) {
    const [accessLevels, setAccessLevels] = useState<AccessLevel[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // ✅ Fetch access levels when modal opens
    useEffect(() => {
        if (open) {
            setLoading(true);
            fetch("/api/access-levels") // Replace with actual API
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

                                {/* Role Dropdown */}
                                <Grid item xs={12}>
                                    {loading ? (
                                        <CircularProgress size={24}/>
                                    ) : (
                                        <FormControl fullWidth size="small"
                                                     error={touched.role && Boolean(errors.role)}>
                                            <InputLabel shrink>Role</InputLabel>
                                            <Select
                                                name="role"
                                                value={values.role}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                displayEmpty
                                            >
                                                <MenuItem disabled value="">Select a role</MenuItem>
                                                {accessLevels.map((level) => (
                                                    <MenuItem key={level} value={level}>
                                                        {level.charAt(0).toUpperCase() + level.slice(1)}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {touched.role && errors.role && (
                                                <p style={{color: "red", margin: 0}}>{errors.role}</p>
                                            )}
                                        </FormControl>
                                    )}
                                </Grid>
                            </Grid>

                            {/* Buttons */}
                            <DialogActions sx={{px: 3, pb: 2, justifyContent: "space-between"}}>
                                <Button onClick={onClose} color="secondary">Cancel</Button>
                                <Button variant="contained" type="submit">Add</Button>
                            </DialogActions>
                        </Form>
                    )}
                </Formik>
            </DialogContent>
        </Dialog>
    );
}
