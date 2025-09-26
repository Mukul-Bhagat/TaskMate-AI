import React, { useContext, useEffect, useState } from "react";
import { SIDE_MENU_DATA, SIDE_MENU_USER_DATA } from "../../utils/data";
import { UserContext } from "../../context/userContext";
import { useNavigate } from "react-router-dom";
import { LuLogOut } from "react-icons/lu";

const SideMenu = ({ activeMenu }) => {
  const { user, clearUser } = useContext(UserContext);
  const [sideMenuData, setSideMenuData] = useState([]);
  const navigate = useNavigate();

  const handleClick = (route) => {
    navigate(route);
  };

  const handleLogout = () => {
    clearUser();
    navigate("/login");
  };

  useEffect(() => {
    if (user) {
      setSideMenuData(
        user.role === "admin" ? SIDE_MENU_DATA : SIDE_MENU_USER_DATA
      );
    }
  }, [user]);

  return (
    <div className="w-64 h-[calc(100vh-61px)] bg-white border-r border-gray-200/50 sticky top-[61px] z-20 flex flex-col justify-between">
      <div>
        {/* Reverted Profile Section */}
        <div className="flex flex-col items-center justify-center mb-7 pt-5 text-center">
          <div className="relative">
            <img
              src={user?.profileImageUrl || null}
              alt="Profile"
              className="w-20 h-20 bg-slate-400 rounded-full object-cover"
            />
          </div>
          {user?.role === "admin" && (
            <div className="text-[10px] font-medium text-white bg-primary px-3 py-0.5 rounded mt-1">
              Admin
            </div>
          )}
          <h5 className="text-gray-950 font-medium leading-6 mt-3">
            {user?.name || ""}
          </h5>
          <p className="text-[12px] text-gray-500">{user?.email || ""}</p>
        </div>

        {sideMenuData.map((item, index) => (
          <button
            key={`menu_${index}`}
            className={`w-full flex items-center gap-4 text-[15px] ${
              activeMenu === item.label
                ? "text-primary bg-gradient-to-r from-blue-50/40 to-blue-100/50 border-r-4 border-primary font-medium"
                : "text-slate-600"
            } py-3 px-6 mb-3 cursor-pointer hover:bg-gray-50`}
            onClick={() => handleClick(item.path)}
          >
            <item.icon className="text-xl" />
            {item.label}
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200/80">
        <button
          className="w-full flex items-center gap-4 text-[15px] py-3 px-6 text-slate-600 hover:bg-gray-50 cursor-pointer"
          onClick={handleLogout}
        >
          <LuLogOut className="text-xl" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default SideMenu;