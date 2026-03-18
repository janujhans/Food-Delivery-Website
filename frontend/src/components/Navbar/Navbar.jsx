import { useContext, useState } from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../context/StoreContext";
import { ThemeContext } from "../context/ThemeContext";

const Navbar = () => {
  const [menu, setMenu] = useState("home");

  const {
    getTotalCartAmount,
    token,
    setToken,
    role,
    setRole,
    userInfo,
    setUserInfo,
  } =
    useContext(StoreContext);

  const { theme, toggleTheme } =
    useContext(ThemeContext);

  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userInfo");
    setToken("");
    setRole("user");
    setUserInfo(null);
    navigate("/");
  };

  return (
    <div className="navbar">
      <Link to="/" tabIndex={-1}>
        <img src={assets.logo} alt="" className="logo" tabIndex={-1} />
      </Link>

      <ul className="navbar-menu">
        <Link to="/" tabIndex={-1} onClick={() => setMenu("home")} className={menu === "home" ? "active" : ""}>home</Link>
        <a href="#explore-menu" tabIndex={-1} onClick={() => setMenu("menu")} className={menu === "menu" ? "active" : ""}>menu</a>
        <a href="#app-download" tabIndex={-1} onClick={() => setMenu("mobile-app")} className={menu === "mobile-app" ? "active" : ""}>mobile-app</a>
        <a href="#footer" tabIndex={-1} onClick={() => setMenu("contact-us")} className={menu === "contact-us" ? "active" : ""}>contact us</a>
      </ul>

      <div className="navbar-right">
        {/* 🌙 Theme Toggle */}
        <button
          className="theme-toggle"
          tabIndex={-1}
          onClick={toggleTheme}
          title="Toggle theme"
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>

        <div className="navbar-search-icon">
          <Link to="/cart" tabIndex={-1}>
            <img src={assets.basket_icon} alt="" tabIndex={-1} />
          </Link>
          <div className={getTotalCartAmount() === 0 ? "" : "dot"} />
        </div>

        <div className="navbar-profile">
          <img src={assets.profile_icon} alt="" tabIndex={-1} />
          <ul className="nav-profile-dropdown">
            <li onClick={() => navigate("/myorders")}>
              <img src={assets.bag_icon} alt="" />
              <p>Orders</p>
            </li>
            <hr />
            <li onClick={logout}>
              <img src={assets.logout_icon} alt="" />
              <p>Logout</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
