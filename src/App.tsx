import Layout from "./Layout.tsx";
import {Route, Routes} from "react-router-dom";
import DashboardPage from "./pages/Dashboard.tsx";
import ProcessesPage from "./pages/Processes.tsx";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout/>}>
                <Route index element={<DashboardPage/>}/>
                <Route path="processes" element={<ProcessesPage/>}/>
                {/*
                <Route path="instances" element={<InstancesPage />} />
                <Route path="profiles" element={<ProfilesPage />} />
                <Route path="team" element={<TeamPage />} />
                <Route path="logout" element={<LogoutPage />} />*/}
            </Route>
        </Routes>
    );
}
