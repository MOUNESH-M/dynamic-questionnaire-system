import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";

import AdminDashboard from "./pages/AdminDashboard";

import TakeQuestionnaire from "./pages/TakeQuestionnaire";

function App() {

    return (

        <Routes>

            <Route
                path="/"
                element={<Login />}
            />

            <Route
                path="/admin"
                element={
                    <AdminDashboard />
                }
            />

            <Route
                path="/questionnaire"
                element={
                    <TakeQuestionnaire />
                }
            />

        </Routes>
    );
}

export default App;