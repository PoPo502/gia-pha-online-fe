import { Routes, Route, Navigate } from "react-router-dom";
import { RequireAuth, RequireRole } from "./components/Guards.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import SearchPersons from "./pages/SearchPersons.jsx";
import PersonsList from "./pages/PersonsList.jsx";
import PersonDetail from "./pages/PersonDetail.jsx";
import PersonTree from "./pages/PersonTree.jsx";
import Admin from "./pages/Admin.jsx";
import Preview from "./pages/Preview.jsx";
import Events from "./pages/Events.jsx";
import Moderation from "./pages/Moderation.jsx";
import { DEV_BYPASS_AUTH } from "./dev/devConfig.js";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={DEV_BYPASS_AUTH ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={DEV_BYPASS_AUTH ? <Navigate to="/" replace /> : <Register />} />

      <Route path="/preview" element={<Preview />} />

      <Route
        path="/"
        element={
          <RequireAuth>
            <Home />
          </RequireAuth>
        }
      />

      <Route
        path="/search/persons"
        element={
          <RequireAuth>
            <SearchPersons />
          </RequireAuth>
        }
      />

      <Route
        path="/persons"
        element={
          <RequireAuth>
            <PersonsList />
          </RequireAuth>
        }
      />

      <Route
        path="/persons/:id"
        element={
          <RequireAuth>
            <PersonDetail />
          </RequireAuth>
        }
      />

      <Route
        path="/persons/:id/tree"
        element={
          <RequireAuth>
            <PersonTree />
          </RequireAuth>
        }
      />

      <Route
        path="/events"
        element={
          <RequireAuth>
            <Events />
          </RequireAuth>
        }
      />

      <Route
        path="/moderation"
        element={
          <RequireAuth>
            <RequireRole role="TREE_ADMIN">
              <Moderation />
            </RequireRole>
          </RequireAuth>
        }
      />

      <Route
        path="/admin"
        element={
          <RequireAuth>
            <RequireRole role="SUPER_ADMIN">
              <Admin />
            </RequireRole>
          </RequireAuth>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
