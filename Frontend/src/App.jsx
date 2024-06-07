import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

import Users from "./user/pages/Users";
import NewPlace from "./places/pages/NewPlace";
import UserPlaces from "./places/pages/UserPlaces";
import UpdatePlace from "./places/pages/UpdatePlace";
import Auth from "./user/pages/Auth";
import MainNavigation from "./shared/components/Navigation/MainNavigation";

const RoutesComponent = () => {
  return (
    <Routes>
      <Route path="/" element={<Users />} exact />
      <Route path="/:userId/places" element={<UserPlaces />} exact />
      <Route path="/places/new" element={<NewPlace />} exact />
      <Route path="/places/:placeId" element={<UpdatePlace />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <MainNavigation />
      <RoutesComponent />
    </Router>
  );
};

export default App;
