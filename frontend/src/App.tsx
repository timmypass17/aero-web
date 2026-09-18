import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage.tsx";
import HomePage from "./pages/HomePage.tsx";
import ProtectedRoute from "./components/ProtectedRoute";
import MapPage from "./pages/MapPage/MapPage.tsx";
import ProtectedLayout from "./components/ProtectedLayout.tsx";
import "./styles/App.css"
import CreateRoutePage from "./pages/CreateRoutePage/CreateRoutePage.tsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Public */}
                <Route element={<ProtectedLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/map" element={<MapPage />} />
                </Route>

                {/* Authentication */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />

                {/* Authenticated */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<ProtectedLayout />}>
                        <Route path="/create-route" element={<>Create Route</>} />
                        <Route path="/routes/new" element={<CreateRoutePage/>} />
                    </Route>
                </Route>

            </Routes>
        </BrowserRouter>
    );
}
export default App;