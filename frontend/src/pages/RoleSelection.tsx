import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

function RoleSelection() {
  const navigate = useNavigate();

  const goToSignInPage = () => {
    const role = document.getElementById('role').value;
    if (role === 'admin') {
      navigate('/admin-signin');
    } else if (role === 'manager') {
      navigate('/manager-signin');
    } else if (role === 'employee') {
      navigate('/employee-signin');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-blue-100">
      <div className="text-center bg-white p-8 rounded-lg shadow-lg w-80 border-t-4 border-green-500">
        <img src={logo} alt="App Logo" className="w-24 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-green-500 mb-2">
          Welcome to ShiftEase App
        </h2>
        <p className="text-gray-600 text-lg mb-4">Please select your role to continue:</p>
        <select id="role" className="w-full px-3 py-2 mb-4 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-300">
          <option value="admin">I am an Admin</option>
          <option value="manager">I am a Manager</option>
          <option value="employee">I am an Employee</option>
        </select>
        <button 
          onClick={goToSignInPage} 
          className="w-full py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-700 transition"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default RoleSelection;