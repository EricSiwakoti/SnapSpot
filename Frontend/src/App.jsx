import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";

import Users from "./user/pages/Users";
import NewPlace from "./places/pages/NewPlace";

const RoutesComponent = () => {
  let navigate = useNavigate();

  return (
    <Routes>
      <Route path="/" element={<Users />} />
      <Route path="/places/new" element={<NewPlace />} />
      <Route
        path="*"
        element={() => {
          navigate("/", { replace: true });
          return null;
        }}
      />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <RoutesComponent />
    </Router>
  );
};

export default App;
