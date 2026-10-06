import { Route, Routes } from "react-router";
import NotFoundPage from "./components/NotFoundPage";
import { RequireAuth, RequireFacility, RequirePermission } from "./features/auth/RouteGuards";
import LoginPage from "./features/auth/pages/LoginPage";
import SelectFacilityPage from "./features/auth/pages/SelectFacilityPage";
import DepartmentsPage from "./features/facilities/pages/DepartmentsPage";
import FacilityProfilePage from "./features/facilities/pages/FacilityProfilePage";
import HomePage from "./features/home/HomePage";
import AppLayout from "./layouts/AppLayout";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        <Route path="/select-facility" element={<SelectFacilityPage />} />
        <Route element={<RequireFacility />}>
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route element={<RequirePermission permission="facility.view" />}>
              <Route path="facility" element={<FacilityProfilePage />} />
            </Route>
            <Route element={<RequirePermission permission="departments.view" />}>
              <Route path="departments" element={<DepartmentsPage />} />
            </Route>
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;