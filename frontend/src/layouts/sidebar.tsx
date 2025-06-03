import React from "react";
import logo from "../assets/logo.png";

import { AiOutlineDashboard } from "react-icons/ai";
import { VscOrganization } from "react-icons/vsc";
import { LiaCalendarAltSolid } from "react-icons/lia";
import { CiStar } from "react-icons/ci";
import { NavLink, Outlet } from "react-router-dom";

export function Sidebar() {
  return (
    <div className="h-screen flex flex-col">
      <div className="w-full z-10 bg-black  flex flex-col px-4 py-1">
        <nav className="flex justify-between space-y-4">
          <img src={logo} alt="App Logo" className="w-20" />
          <div className="flex gap-4">
            <NavLink to="/dashboard" className="flex flex-col items-center">
              <AiOutlineDashboard className="text-white text-3xl mb-1" />
              <span className="text-xs text-white">Dashboard</span>
            </NavLink>
            <NavLink to="/organizations" className="flex flex-col items-center">
              <VscOrganization className="text-white text-3xl mb-1" />
              <span className="text-xs text-white">Organizations</span>
            </NavLink>
            <NavLink to="/schedules" className="flex flex-col items-center">
              <LiaCalendarAltSolid className="text-white text-3xl mb-1" />
              <span className="text-xs text-white">Schedules</span>
            </NavLink>
            <NavLink to="/availability" className="flex flex-col items-center">
              <CiStar className="text-white text-3xl mb-1" />
              <span className="text-xs text-white">Availability</span>
            </NavLink>
          </div>
        </nav>
      </div>
      <Outlet />
    </div>
  );
}
