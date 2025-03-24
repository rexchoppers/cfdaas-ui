import {useEffect, useState} from "react";
import {
    Dialog, DialogActions, DialogContent, DialogTitle,
    Grid, Button, TextField, MenuItem, CircularProgress, Alert
} from "@mui/material";
import {Formik, Form} from "formik";
import * as Yup from "yup";
import {useAuth} from "react-oidc-context";
import {useCompany} from "../context/CompanyContext.tsx";
import {Access} from "../types/Access.ts";
import {User} from "../types/User.ts";
import {authRequest} from "../utils/AuthenticatedRequestUtil.ts";

type AccessLevel = "owner" | "admin" | "editor" | "viewer";

interface EditMemberModalProps {
    open: boolean;
    onClose: (updatedAccess?: Access) => void;
    memberId: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    level: Yup.string().required("Role is required"),
});

export default function EditMemberModal({open, onClose, memberId}: EditMemberModalProps) {
    const auth = useAuth();
    const company = useCompany();

    const [member, setMember] = useState<Access | null>(null);
    const [accessLevels, setAccessLevels] = useState<AccessLevel[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [apiError, setApiError] = useState<string | null>(null);

    // Fetch roles + member details
    useEffect(() => {
        console.log("MEMBER ID", memberId);

        if (!open || !memberId) return;

        setApiError(null);
        setLoading(true);


        Promise.all([
            authRequest(auth, `${API_BASE_URL}/access/level`),
            authRequest(auth, `${API_BASE_URL}/company/${company.selectedCompany.id}/team/${memberId}`)
        ])
            .then(async ([rolesRes, memberRes]) => {
                if (!rolesRes || !rolesRes.ok || !memberRes || !memberRes.ok) {
                    throw new Error("Failed to load data");
                }

                const levels = await rolesRes.json();
                const memberData = await memberRes.json();

                setAccessLevels(levels);
                setMember(memberData);
            })
            .catch(err => setApiError(err.message || "Failed to load member"))
            .finally(() => setLoading(false));
    }, [open, memberId]);

    const handleSubmit = async (values: {
        firstName: string;
        lastName: string;
        email: string;
        level: string;
    }) => {
        try {
            const res = await authRequest(
                auth,
                `${API_BASE_URL}/company/${company.selectedCompany.id}/team/${memberId}`,
                "PATCH",
                values
            );

            if (!res || !res.ok) {
                const data = await res?.json();
                throw new Error(data?.message || "Failed to update member");
            }

            const updatedMember: Access = await res.json();
            onClose(updatedMember);
        } catch (err: any) {
            setApiError(err.message || "Update failed");
        }
    };

    const user = member?.user as User;

    return (
        <Dialog open={open} onClose={() => onClose()} fullWidth maxWidth="sm">
            <DialogTitle sx={{pb: 2}}>Edit Member</DialogTitle>
            <DialogContent sx={{overflow: "visible", pt: 1, pb: 3}}>
                {apiError && <Alert severity="error" sx={{mb: 2}}>{apiError}</Alert>}

                {loading || !member ? (
                    <CircularProgress sx={{mt: 4}}/>
                ) : (
                    <Formik
                        initialValues={{
                            firstName: user?.firstName || "",
                            lastName: user?.lastName || "",
                            email: user?.email || "",
                            level: member.level || "",
                        }}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                        enableReinitialize
                    >
                        {({values, handleChange, handleBlur, errors, touched}) => (
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
                                            disabled
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
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
                                    </Grid>
                                </Grid>
                                <DialogActions sx={{pt: 2, px: 0, justifyContent: "flex-end", gap: 2}}>
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
                )}
            </DialogContent>
        </Dialog>
    );
}
