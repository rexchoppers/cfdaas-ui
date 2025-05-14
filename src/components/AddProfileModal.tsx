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
  Alert,
  Typography
} from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useAuth } from "react-oidc-context";
import { useCompany } from "../context/CompanyContext.tsx";
import {
  Platform,
  CredentialType,
  platformCredentialTypes,
  formatPlatformForDisplay,
  formatCredentialTypeForDisplay
} from "../types/profile.types.ts";

interface AddProfileModalProps {
  open: boolean;
  onClose: (success?: boolean) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  description: Yup.string(),
  platform: Yup.string().required("Platform is required"),
  credentialType: Yup.string().required("Credential type is required"),
  credentialData: Yup.string().required("Credential data is required"),
});

export default function AddProfileModal({ open, onClose }: AddProfileModalProps) {
  const auth = useAuth();
  const company = useCompany();
  const [loading, setLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Reset error when modal opens
  useEffect(() => {
    if (open) {
      setApiError(null);
    }
  }, [open]);

  const handleSubmit = async (values: {
    name: string;
    description: string;
    platform: Platform;
    credentialType: CredentialType;
    credentialData: string;
  }) => {
    try {
      setLoading(true);
      setApiError(null);

      // Convert credential data to base64 if it's not already
      let credentialDataBase64 = values.credentialData;
      try {
        // Try to parse as JSON to validate
        JSON.parse(values.credentialData);
        // If valid JSON, encode to base64
        credentialDataBase64 = btoa(values.credentialData);
      } catch (e) {
        // If not valid JSON, assume it's already base64 encoded
        try {
          // Validate it's actually base64 by trying to decode it and parse as JSON
          JSON.parse(atob(values.credentialData));
        } catch (e) {
          throw new Error("Credential data must be valid JSON");
        }
      }

      const response = await fetch(`${API_BASE_URL}/company/${company.selectedCompany.id}/profile`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${auth.user?.id_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          credentialData: credentialDataBase64
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create profile");
      }

      onClose(true);
    } catch (error) {
      setApiError((error as Error).message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason !== "backdropClick" && !loading) {
          onClose();
        }
      }}
      fullWidth
      maxWidth="md"
      disableEscapeKeyDown
    >
      <DialogTitle sx={{ pb: 2 }}>Add New Profile</DialogTitle>
      <DialogContent sx={{ overflow: "visible", pt: 1, pb: 3 }}>
        {apiError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {apiError}
          </Alert>
        )}

        <Formik
          initialValues={{
            name: "",
            description: "",
            platform: Platform.GCP,
            credentialType: CredentialType.GCP_SERVICE_ACCOUNT,
            credentialData: "",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, handleChange, handleBlur, errors, touched, setFieldValue }) => (
            <Form>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Description (Optional)"
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.description && Boolean(errors.description)}
                    helperText={touched.description && errors.description}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Platform"
                    name="platform"
                    value={values.platform}
                    onChange={(e) => {
                      const platform = e.target.value as Platform;
                      setFieldValue("platform", platform);
                      // Set the first valid credential type for the selected platform
                      if (platformCredentialTypes[platform]?.length > 0) {
                        setFieldValue("credentialType", platformCredentialTypes[platform][0]);
                      }
                    }}
                    onBlur={handleBlur}
                    error={touched.platform && Boolean(errors.platform)}
                    helperText={touched.platform && errors.platform}
                  >
                    {/* Initially only show GCP as an option */}
                    <MenuItem key={Platform.GCP} value={Platform.GCP}>
                      {formatPlatformForDisplay(Platform.GCP)}
                    </MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Credential Type"
                    name="credentialType"
                    value={values.credentialType}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.credentialType && Boolean(errors.credentialType)}
                    helperText={touched.credentialType && errors.credentialType}
                  >
                    {platformCredentialTypes[values.platform]?.map((credType) => (
                      <MenuItem key={credType} value={credType}>
                        {formatCredentialTypeForDisplay(credType)}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Paste your credential JSON data below. For GCP, this is the service account key JSON.
                    Information like project ID, region, and account ID will be automatically extracted from this JSON.
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={8}
                    label="Credential Data"
                    name="credentialData"
                    value={values.credentialData}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.credentialData && Boolean(errors.credentialData)}
                    helperText={touched.credentialData && errors.credentialData}
                    size="small"
                  />
                </Grid>
              </Grid>
              <DialogActions sx={{ pt: 3, px: 0, display: "flex", justifyContent: "flex-end", gap: 2 }}>
                <Button
                  onClick={() => onClose()}
                  variant="contained"
                  color="inherit"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : "Add Profile"}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
