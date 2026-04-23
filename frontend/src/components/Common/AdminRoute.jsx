import React from "react";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const userStr = localStorage.getItem("user");
  let user = null;

  try {
    if (userStr) {
      user = JSON.parse(userStr);
    }
  } catch (error) {
    console.error("Error parsing user from localStorage", error);
  }

  // If there is no user or user role is not admin, redirect to home page
  if (!user || user.role !== "admin") {
    // Optionally, we can show a toast message here although it might trigger on every render if not careful.
    // However, typical pattern is to just redirect.
    return <Navigate to="/" replace />;
  }

  // If user is admin, allow access to children
  return children;
};

export default AdminRoute;
