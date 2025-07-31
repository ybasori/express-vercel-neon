import {
  setFilter,
  setPage,
  setSort,
} from "@src/_states/reducers/blogTag/blogTag.slice";
import {
  fetchBlogTag,
} from "@src/_states/reducers/blogTag/blogTag.thunk";
import { notify } from "@src/_states/reducers/notif/notif.thunk";
import Modal from "@src/components/atoms/Modal/Modal";
import Table from "@src/components/atoms/Table/Table";
import { api } from "../../../../../../_config/config";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@src/_states/store";
import { RootState } from "@src/_states/types";
import { NavLink } from "react-router-dom";

const Tag = () => {
  const [oneTime, setOneTime] = useState(true);
  const [loadContent, setLoadContent] = useState(false);
  const [deleteMoreModal, setDeleteMoreModal] = useState(false);
  const [dataChecked, setDataChecked] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const blogTag = useSelector((state:RootState)=>(state.blogTag));
  const dispatch = useDispatch<AppDispatch>();

  const onDeleteMore = (index: number = 0) => {
    setSubmitting(true);
    fetch(
      `${api.DASHBOARD_BLOG_TAG_DELETE}/${
        blogTag.response?.result.data[dataChecked[index]].uid
      }`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        if (index + 1 < dataChecked.length) {
          onDeleteMore(index + 1);
        } else {
          setSubmitting(false);
          dispatch(notify({title:"", text:data.message, timer:5000}));
          setDeleteMoreModal(false);
          setDataChecked([]);
          dispatch(
            setPage({
              ...blogTag.page,
              of: 1,
            })
          );
          dispatch(
            setSort([
              {
                by: "created_at",
                order: "desc",
              },
            ])
          );
          dispatch(
            fetchBlogTag({page:blogTag.page, sort:blogTag.sort, filter:blogTag.filter, show:[
              "uid",
              "name",
              "created_at",
              "updated_at",
            ]})
          );
        }
      })
      .catch((err) => {
        console.log(err);
        setSubmitting(false);
        dispatch(notify({title:"", text:"Something went wrong!", timer:5000}));
      });
  };

  useEffect(() => {
    if (oneTime) {
      setOneTime(false);
      if (!!!blogTag.response) {
        setLoadContent(true);
      }
    }
  }, [blogTag.response, oneTime]);

  useEffect(() => {
    if (loadContent) {
      setLoadContent(false);
      dispatch(
        fetchBlogTag({page:blogTag.page, sort:blogTag.sort, filter:blogTag.filter, show:[
          "uid",
          "name",
          "created_at",
          "updated_at",
        ]})
      );
    }
  }, [blogTag.filter, blogTag.page, blogTag.sort, dispatch, loadContent]);

  return (
    <>
      <div className="buttons">
        <button
          className="button is-info is-small"
          type={"button"}
          onClick={() => setLoadContent(true)}
          disabled={submitting}
        >
          Reload
        </button>
        <NavLink
          className={()=>"button is-success is-small"}
          to="/dashboard/blog/tag/create"
        >
          Add
        </NavLink>
        {dataChecked.length > 0 ? (
          <button
            className="button is-danger is-small"
            type="button"
            onClick={() => setDeleteMoreModal(true)}
            disabled={submitting}
          >
            Delete
          </button>
        ) : null}
      </div>

      <Table
        sort={blogTag.sort}
        onSort={(s) => {
          dispatch(setSort([...s]));
          setLoadContent(true);
        }}
        page={blogTag.page}
        totalPage={
          Math.ceil((blogTag.response?.result.total ?? 1) / blogTag.page.size) ?? 1
        }
        onPage={(page) => {
          dispatch(setPage(page));
          setLoadContent(true);
        }}
        filter={blogTag.filter}
        onFilter={(f) => {
          dispatch(setFilter(f));
          setLoadContent(true);
        }}
        check={dataChecked}
        onCheckChange={(keys) => {
          setDataChecked(keys);
        }}
        data={!!blogTag.response ? blogTag.response.result.data : []}
        columns={[
          { name: "Name", field: "name", sortable: true, searchable: true },
          { name: "Author", field: "created_by.name", sortable: false },
          {
            name: "Created At",
            field: "created_at",
            sortable: true,
            searchable: true,
          },
          {
            name: "Updated At",
            field: "updated_at",
            sortable: true,
            searchable: true,
          },
          {
            name: "Action",
            render: (_cell, row) => {
              return (
                <>
                  <NavLink
                    className={()=>"button is-info is-small"}
                    to={`/dashboard/blog/tag/edit/${row.uid}`}
                  >
                    Edit
                  </NavLink>
                </>
              );
            },
          },
        ]}
        loading={blogTag.loading}
      />

      {!!deleteMoreModal ? (
        <Modal
          title={`Delete ${dataChecked.length} contents`}
          onClose={() => setDeleteMoreModal(false)}
        >
          <div className="buttons">
            <button
              className="button is-success"
              type="button"
              onClick={() => onDeleteMore()}
              disabled={submitting}
            >
              Sure
            </button>
            <button className="button" type="button" disabled={submitting}>
              Cancel
            </button>
          </div>
        </Modal>
      ) : null}
    </>
  );
};

export default Tag;
