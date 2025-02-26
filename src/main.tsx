import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import {createTheme, CssBaseline, ThemeProvider} from "@mui/material";
import {AuthProvider} from "react-oidc-context";
import {WebStorageStateStore} from "oidc-client-ts";
import {BrowserRouter} from "react-router-dom";

const theme = createTheme();

const oidcConfig = {
    authority: 'https://cognito-idp.eu-west-2.amazonaws.com/eu-west-2_OL9Bf50OK',
    client_id: '5hhiivokqjtpk9s6mv1pmch51j',
    redirect_uri: "http://localhost:5173",
    response_type: "code",
    scope: "email openid phone profile",
    userStore: new WebStorageStateStore({ store: window.sessionStorage }),
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <AuthProvider {...oidcConfig}>
          <ThemeProvider theme={theme}>
              <CssBaseline />
              <BrowserRouter>
                  <App />
              </BrowserRouter>
          </ThemeProvider>
      </AuthProvider>
  </StrictMode>,
)
