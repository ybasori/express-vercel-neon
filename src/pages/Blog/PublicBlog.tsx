import { fetchPublicBlogCategory } from "@src/_states/reducers/publicBlogCategory/publicBlogCategory.thunk";
import { AppDispatch } from "@src/_states/store";
import { RootState } from "@src/_states/types";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "@src/components/molecules/Navbar/Navbar";
import { NavLink } from "react-router-dom";

const PublicBlog:React.FC<{children?:React.ReactNode}> = ({children}) => {
  const [oneTime, setOneTime] = useState(true);
  const [loadContent, setLoadContent] = useState(false);

  const publicBlogCategory = useSelector(
    (state: RootState) => state.publicBlogCategory
  );
  const dispatch = useDispatch<AppDispatch>();


  useEffect(() => {
    if (oneTime) {
      setOneTime(false);
      if (!!!publicBlogCategory.response) {
        setLoadContent(true);
      }
    }
  }, [publicBlogCategory.response, oneTime]);

  useEffect(() => {
    if (loadContent) {
      setLoadContent(false);
      dispatch(
        fetchPublicBlogCategory({
          page: publicBlogCategory.page,
          sort: publicBlogCategory.sort,
          filter: publicBlogCategory.filter,
          show: ["uid", "name", "content", "created_at", "updated_at"],
        })
      );
    }
  }, [
    publicBlogCategory.filter,
    publicBlogCategory.page,
    publicBlogCategory.sort,
    dispatch,
    loadContent,
  ]);
  return (
    <>
      <Navbar />

      <section className="section">
        <div className="container pt-5">
          <div className="columns">
            <div className="column">
              {children}
            </div>
            <div className="column is-one-third">
              <article className="panel is-primary">
                <p className="panel-heading">Categories</p>
                <div className="panel-block">
                  <p className="control has-icons-left">
                    <input
                      className="input is-primary"
                      type="text"
                      placeholder="Search"
                    />
                    <span className="icon is-left">
                      <i className="fas fa-search" aria-hidden="true"></i>
                    </span>
                  </p>
                </div>
                {publicBlogCategory.loading ? (
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                ) : (
                  <>
                    {(!!publicBlogCategory.response
                      ? publicBlogCategory.response.result.data
                      : []
                    ).map((item, key: number) => (
                      <React.Fragment key={key}>
                        <NavLink
                          className={()=>"panel-block is-active"}
                          to={`/blog/category/${item.uid}`}
                        >
                          <span className="panel-icon">
                            <i className="fas fa-book" aria-hidden="true"></i>
                          </span>
                          {item.name} ({item.content.total})
                        </NavLink>
                      </React.Fragment>
                    ))}
                  </>
                )}
              </article>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default PublicBlog;
