import React, { useRef, useEffect, useState, useContext } from "react";
import SidebarLogo from "./Logo";
import Navmenu from "./Navmenu";
import { menuItems, menuItemsAdministrador, menuItemsGuia } from "@/constant/data";
import SimpleBar from "simplebar-react";
import useSidebar from "@/hooks/useSidebar";
import useSemiDark from "@/hooks/useSemiDark";
import useSkin from "@/hooks/useSkin";
import Logout from "./Logout";
import { UserContext } from "../../../pages/context/userContext";

const Sidebar = () => {
  const userCtx = useContext(UserContext);
  const { user, authStatus, verifyingToken } = userCtx;

  const scrollableNodeRef = useRef();
  const [scroll, setScroll] = useState(false);

  useEffect(() => {
    verifyingToken();
    const handleScroll = () => {
      if (scrollableNodeRef.current.scrollTop > 0) {
        setScroll(true);
      } else {
        setScroll(false);
      }
    };
    scrollableNodeRef.current.addEventListener("scroll", handleScroll);
  }, [scrollableNodeRef]);

  const [collapsed, setMenuCollapsed] = useSidebar();
  const [menuHover, setMenuHover] = useState(false);

  // semi dark option
  const [isSemiDark] = useSemiDark();
  // skin
  const [skin] = useSkin();
  return (
    <div className={isSemiDark ? "dark" : ""}>
      <div
        className={`sidebar-wrapper bg-white dark:bg-slate-800     ${
          collapsed ? "w-[72px] close_sidebar" : "w-[248px]"
        }
      ${menuHover ? "sidebar-hovered" : ""}
      ${
        skin === "bordered"
          ? "border-r border-slate-200 dark:border-slate-700"
          : "shadow-base"
      }
      `}
        onMouseEnter={() => {
          setMenuHover(true);
        }}
        onMouseLeave={() => {
          setMenuHover(false);
        }}
      >
        <SidebarLogo menuHover={menuHover} />
        <div
          className={`h-[60px]  absolute top-[80px] nav-shadow z-[1] w-full transition-all duration-200 pointer-events-none ${
            scroll ? " opacity-100" : " opacity-0"
          }`}
        ></div>

        <SimpleBar
          className="sidebar-menu px-4 h-[calc(100%-80px)]"
          scrollableNodeProps={{ ref: scrollableNodeRef }}
        >
          {user && (
          user[0].isSuperAdmin == 1 ? (
            <Navmenu menus={menuItems} />
          ) : user[0].isAdmin == 1 ? (
            <Navmenu menus={menuItemsAdministrador} />
          ) : user[0].isGuia == 1 ? (
            <Navmenu menus={menuItemsGuia} />
          ) : (
            <></>
          )
        )}
        <Logout />
        </SimpleBar>
      </div>
    </div>
  );
};

export default Sidebar;
