import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {createTheme, CssBaseline, ThemeProvider} from "@mui/material";
import {AuthProvider} from "react-oidc-context";

const theme = createTheme();

const oidcConfig = {
    authority: 'eu-west-2ol9bf50ok.auth.eu-west-2.amazoncognito.com',
    client_id: '5hhiivokqjtpk9s6mv1pmch51j',
    redirect_uri: "http://localhost:5173/",
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <AuthProvider {...oidcConfig}>
          <ThemeProvider theme={theme}>
              <CssBaseline />
              <App />
          </ThemeProvider>
      </AuthProvider>
  </StrictMode>,
)
