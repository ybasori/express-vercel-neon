import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@src/_states/store";
import { RootState } from "@src/_states/types";
import { logout } from "@src/_states/reducers/auth/auth.slice";
import { NavLink, useHistory } from "react-router-dom";

const Navbar = () => {
    const auth = useSelector((state:RootState)=>state.auth);
    const dispatch = useDispatch<AppDispatch>();
    const history = useHistory();

    const [isLogoutLoading, setIsLogoutLoading] = useState(false);
    const [openMenu, setOpenMenu] = useState(false);

    const onLogout = () => {
        setIsLogoutLoading(true);
        fetch("/api/logout", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        })
            .then(res => res.json())
            .then(data => {
                console.log('Response:', data);
                setIsLogoutLoading(false);
                dispatch(logout());
                history.push("/");
            })
            .catch(error => {
                setIsLogoutLoading(false);
                console.error('Error:', error);
            });
    }
    return (<><nav className="navbar" role="navigation" aria-label="main navigation" style={{position: "fixed", width: "100%"}}>
        <div className="navbar-brand">
            <NavLink className={()=>"navbar-item"} to="/">
                <svg height="160" width="640" xmlns="http://www.w3.org/2000/svg">
                    <text x="5" y="20" fill="pink" stroke="blue" fontSize="25">Webivert</text>
                </svg>

            </NavLink>

            <a role="button" className={`navbar-burger ${openMenu ? "is-active" : ""}`} aria-label="menu" aria-expanded="false" data-target="navbarBasicExample" onClick={(e) => { e.preventDefault(); setOpenMenu(!openMenu) }}>
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
            </a>
        </div>

        <div id="navbarBasicExample" className={`navbar-menu ${openMenu ? "is-active" : ""}`}>
            <div className="navbar-start">
                <NavLink to="/" className={()=>"navbar-item"}>Home</NavLink>
                <NavLink to="/blog" className={()=>"navbar-item"}>Blog</NavLink>
                <NavLink to="/about" className={()=>"navbar-item"}>About</NavLink>
            </div>

            <div className="navbar-end">
                {!!auth.userData ? <>
                    <NavLink to="/dashboard" className={()=>"navbar-item"}>Dashboard</NavLink>
                    <div className="navbar-item">
                        <button className="button is-light" type="button" onClick={onLogout} disabled={isLogoutLoading}>
                            Log out {isLogoutLoading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : null}
                        </button>
                    </div>
                </> :
                    <div className="navbar-item"><NavLink className={()=>"button is-light"} to="/login">Log in</NavLink></div>}

            </div>
        </div>
    </nav></>)
}

export default Navbar