import { setPage } from "@src/_states/reducers/publicBlogContent/publicBlogContent.slice";
import { fetchPublicBlogContent } from "@src/_states/reducers/publicBlogContent/publicBlogContent.thunk";
import { setFilter } from "@src/_states/reducers/publicBlogContent/publicBlogContent.slice";
import { AppDispatch } from "@src/_states/store";
import { RootState } from "@src/_states/types";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useLocation, useParams } from "react-router-dom";

const PublicBlogMain = () => {
  const location = useLocation();

  const { uid } = useParams<{ uid: string }>();
  const [oneTime, setOneTime] = useState(true);
  const [loadContent, setLoadContent] = useState(false);

  const publicBlogContent = useSelector(
    (state: RootState) => state.publicBlogContent
  );
  const dispatch = useDispatch<AppDispatch>();

  const listPage = (total: number) => {
    let list: number[] = [];
    for (let i = 1; i <= total; i++) {
      list = [...list, i];
    }
    return list;
  };

  useEffect(() => {
    // Trigger data fetch or "reload" when path changes
    setOneTime(true);
  }, [location.pathname]);

  useEffect(() => {
    if (oneTime) {
      setOneTime(false);
      //   if (!!!publicBlogContent.response) {
      if (!!uid && uid !== publicBlogContent.filter.leftJoin_category_uid) {
        dispatch(setFilter({ leftJoin_category_uid: uid }));
        dispatch(setPage({ ...publicBlogContent.page, of: 1 }));
      }
      if (!!!uid) {
        dispatch(setFilter({}));
      }
      setLoadContent(true);
      //   }
    }
  }, [
    oneTime,
    uid,
    dispatch,
    publicBlogContent.filter,
    publicBlogContent.page,
  ]);

  useEffect(() => {
    if (loadContent) {
      setLoadContent(false);
      dispatch(
        fetchPublicBlogContent({
          page: publicBlogContent.page,
          sort: publicBlogContent.sort,
          filter: publicBlogContent.filter,
          show: ["uid", "title", "content", "created_at", "updated_at"],
        })
      );
    }
  }, [
    publicBlogContent.filter,
    publicBlogContent.page,
    publicBlogContent.sort,
    dispatch,
    loadContent,
  ]);
  return (
    <>
      {publicBlogContent.loading ? (
        <>
          <div className="skeleton-block"></div>
          <div className="skeleton-lines">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </>
      ) : (
        <>
          {(!!publicBlogContent.response
            ? publicBlogContent.response.result.data
            : []
          ).map((item, key: number) => (
            <React.Fragment key={key}>
              <h1 className="title">
                <NavLink to={`/blog/content/${item.uid}`}>{item.title}</NavLink>
              </h1>
              <p className="subtitle">
                My first website with <strong>Bulma</strong>!
              </p>
              <p className="has-text-grey-lighter is-size-6">
                {item.created_at}
              </p>
              <div dangerouslySetInnerHTML={{ __html: item.content }} />
            </React.Fragment>
          ))}
        </>
      )}

      <nav
        className="pagination is-small"
        role="navigation"
        aria-label="pagination"
      >
        <a
          className={`pagination-previous ${
            publicBlogContent.page.of === 1 ? `is-disabled` : ``
          }`}
          onClick={(e) => {
            e.preventDefault();

            if (publicBlogContent.page.of > 1) {
              dispatch(
                setPage({
                  ...publicBlogContent.page,
                  of: publicBlogContent.page.of - 1,
                })
              );

              setLoadContent(true);
            }
          }}
        >
          Previous
        </a>
        <a
          className={`pagination-next ${
            publicBlogContent.page.of ===
            (Math.ceil(
              (publicBlogContent.response?.result.total ?? 1) /
                publicBlogContent.page.size
            ) ?? 1)
              ? `is-disabled`
              : ``
          }`}
          onClick={(e) => {
            e.preventDefault();

            if (
              publicBlogContent.page.of <
              (Math.ceil(
                (publicBlogContent.response?.result.total ?? 1) /
                  publicBlogContent.page.size
              ) ?? 1)
            ) {
              dispatch(
                setPage({
                  ...publicBlogContent.page,
                  of: publicBlogContent.page.of + 1,
                })
              );

              setLoadContent(true);
            }
          }}
        >
          Next page
        </a>
        <ul className="pagination-list m-0">
          {/* <li>
                    <a href="#" className="pagination-link" aria-label="Goto page 1">
                      1
                    </a>
                  </li>
                  <li>
                    <span className="pagination-ellipsis">&hellip;</span>
                  </li> */}

          {listPage(
            Math.ceil(
              (publicBlogContent.response?.result.total ?? 1) /
                publicBlogContent.page.size
            ) ?? 1
          )
            .filter(
              (item) =>
                publicBlogContent.page.of -
                  ((Math.ceil(
                    (publicBlogContent.response?.result.total ?? 1) /
                      publicBlogContent.page.size
                  ) ?? 1) -
                    publicBlogContent.page.of <=
                  2
                    ? 5 -
                      ((Math.ceil(
                        (publicBlogContent.response?.result.total ?? 1) /
                          publicBlogContent.page.size
                      ) ?? 1) -
                        publicBlogContent.page.of)
                    : 3) <
                  item &&
                item <=
                  publicBlogContent.page.of +
                    (publicBlogContent.page.of <= 2
                      ? 5 - publicBlogContent.page.of
                      : 2)
            )
            .map((item, key) => (
              <li key={key}>
                <a
                  className={`pagination-link  ${
                    item === publicBlogContent.page.of ? `is-current` : ``
                  }`}
                  aria-label={`Goto page ${item}`}
                  onClick={(e) => {
                    e.preventDefault();
                    dispatch(setPage({ ...publicBlogContent.page, of: item }));

                    setLoadContent(true);
                  }}
                >
                  {item}
                </a>
              </li>
            ))}

          {/* <li>
                    <span className="pagination-ellipsis">&hellip;</span>
                  </li>
                  <li>
                    <a href="#" className="pagination-link" aria-label="Goto page 86">
                      86
                    </a>
                  </li> */}
        </ul>
      </nav>
    </>
  );
};

export default PublicBlogMain;
