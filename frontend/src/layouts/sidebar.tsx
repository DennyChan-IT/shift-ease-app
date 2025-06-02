import React from "react";
import logo from "../assets/logo.png";

import { AiOutlineDashboard } from "react-icons/ai";
import { VscOrganization } from "react-icons/vsc";
import { LiaCalendarAltSolid } from "react-icons/lia";
import { CiStar } from "react-icons/ci";
import { NavLink, Outlet } from "react-router-dom";

export function Sidebar() {
  return (
    <div className="flex">
      <div className="h-screen w-30 z-10 bg-slate-100 border-r border-r-gray-300 shadow-lg flex flex-col p-4">
        <img src={logo} alt="App Logo" className="w-12 mb-4" />
        <nav className="flex flex-col space-y-4">
          <NavLink to="/dashboard" className="flex flex-col items-center">
            <AiOutlineDashboard className="text-purple-600 text-3xl mb-1" />
            <span className="text-xs text-purple-600">Dashboard</span>
          </NavLink>
          <NavLink to="/organizations" className="flex flex-col items-center">
            <VscOrganization className="text-purple-600 text-3xl mb-1" />
            <span className="text-xs text-purple-600">Organizations</span>
          </NavLink>
          <NavLink to="/schedules" className="flex flex-col items-center">
            <LiaCalendarAltSolid className="text-purple-600 text-3xl mb-1" />
            <span className="text-xs text-purple-600">Schedules</span>
          </NavLink>
          <NavLink to="/availability" className="flex flex-col items-center">
            <CiStar className="text-purple-600 text-3xl mb-1" />
            <span className="text-xs text-purple-600">Availability</span>
          </NavLink>
        </nav>
      </div>
      <Outlet />
    </div>
  );
}
