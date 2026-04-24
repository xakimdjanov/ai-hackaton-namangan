import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import SuperAdmin from './pages/SuperAdmin';
import CreateAdmin from './pages/subpages/CreateAdmin';
import CreateParking from './pages/subpages/CreateParking';
import CreateJoy from './pages/subpages/CreateJoy';
import Admin from './pages/Admin';
import SetEntryPoint from './pages/subpages/SetEntryPoint';
import AddSpot from './pages/subpages/AddSpot';
import GarageManager from './pages/subpages/GarageManager';
import Tourist from './pages/Tourist';
import EditParking from './pages/subpages/EditParking';


const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  
  if (!token) return <Navigate to="/login" />;
  if (role && userRole !== role) return <Navigate to="/" />;
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/super-admin" 
          element={
            <ProtectedRoute role="super_admin">
              <SuperAdmin />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/super-admin/add-admin" 
          element={
            <ProtectedRoute role="super_admin">
              <CreateAdmin />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/super-admin/add-parking" 
          element={
            <ProtectedRoute role="super_admin">
              <CreateParking />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/super-admin/add-joy" 
          element={
            <ProtectedRoute role="super_admin">
              <CreateJoy />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/super-admin/edit-parking/:id" 
          element={
            <ProtectedRoute role="super_admin">
              <EditParking />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin" 
          element={
            <ProtectedRoute role="admin">
              <Admin />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/set-entry" 
          element={
            <ProtectedRoute role="admin">
              <SetEntryPoint />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/add-spot" 
          element={
            <ProtectedRoute role="admin">
              <AddSpot />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/garages" 
          element={
            <ProtectedRoute role="admin">
              <GarageManager />
            </ProtectedRoute>
          } 
        />
        <Route path="/tourist" element={<Tourist />} />
        <Route path="/" element={<Navigate to="/tourist" />} />
      </Routes>
    </Router>
  );
}

export default App;
