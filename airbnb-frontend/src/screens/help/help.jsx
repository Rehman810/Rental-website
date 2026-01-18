import React, { lazy } from "react";
import { Routes, Route } from "react-router-dom";

import TermsPoliciesPage from "../../pages/helpCenter/helpCenter"
import PolicyDetailPage from "../../pages/helpCenter/policyDetails.jsx"

const Help = () => {
  return (
      <div style={{ minHeight: "22vh" }}>
        <Routes>
          {/* Help Center Page */}
          <Route path="/feature" element={<TermsPoliciesPage />} />
          
          {/* Policy Detail Pages */}
          <Route path="/policy-detail/:id" element={<PolicyDetailPage />} />
        </Routes>
      </div>
  );
};

export default Help;
