// import { RootState } from "@src/_states/types";
// import { useSelector } from "react-redux";

import Navbar from "@src/components/molecules/Navbar/Navbar";
import { NavLink } from "react-router-dom";

const Dashboard: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <Navbar />

      <>
        <section className="section">
          <div className="container is-fluid pt-5">
            <div className="columns">
              <div className="column is-one-fifth">
                <div className="card">
                  <div className="card-content">
                    <aside className="menu">
                      <p className="menu-label">General</p>
                      <ul className="menu-list">
                        <li>
                          <NavLink to="/dashboard">Dashboard</NavLink>
                        </li>
                        <li>
                          <NavLink to="/dashboard/page">Pages</NavLink>
                        </li>
                        <li>
                          <NavLink to="/dashboard/blog" className="is-active">
                            Blog
                          </NavLink>
                          <ul>
                            <li>
                              <NavLink to="/dashboard/blog">Main</NavLink>
                            </li>
                            <li>
                              <NavLink to="/dashboard/blog/content">
                                Contents
                              </NavLink>
                            </li>
                            <li>
                              <NavLink to="/dashboard/blog/category">
                                Categories
                              </NavLink>
                            </li>
                            <li>
                              <NavLink to="/dashboard/blog/tag">Tags</NavLink>
                            </li>
                            <li>
                              <NavLink to="/dashboard/blog/comment">
                                Comment
                              </NavLink>
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </aside>
                  </div>
                </div>
              </div>
              <div className="column">
                <div className="container">
                  <nav className="breadcrumb is-small" aria-label="breadcrumbs">
                    <ul>
                      <li>
                        <a href="#">Bulma</a>
                      </li>
                      <li>
                        <a href="#">Documentation</a>
                      </li>
                      <li>
                        <a href="#">Components</a>
                      </li>
                      <li className="is-active">
                        <a href="#" aria-current="page">
                          Breadcrumb
                        </a>
                      </li>
                    </ul>
                  </nav>

                  <div className="card">
                    <header className="card-header">
                      <p className="card-header-title">AAAA</p>
                      {/* <button className="card-header-icon" aria-label="more options">
                  <span className="icon">
                    <i className="fas fa-angle-down" aria-hidden="true"></i>
                  </span>
                </button> */}
                    </header>
                    <div className="card-content">
                      <div className="content">{children}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>

      <footer className="footer">
        <div className="content has-text-centered">
          <p>
            <strong>Webivert</strong> by{" "}
            <a href="https://jgthms.com">Yusuf Basori</a>.
          </p>
        </div>
      </footer>
    </>
  );
};

export default Dashboard;
