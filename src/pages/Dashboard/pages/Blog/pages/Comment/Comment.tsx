import {
  setFilter,
  setPage,
  setSort,
} from "@src/_states/reducers/blogComment/blogComment.slice";
import Modal from "@src/components/atoms/Modal/Modal";
import Table from "@src/components/atoms/Table/Table";
import { api } from "../../../../../../_config/config";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@src/_states/store";
import { RootState } from "@src/_states/types";
import { fetchBlogComment } from "@src/_states/reducers/blogComment/blogComment.thunk";
import { notify } from "@src/_states/reducers/notif/notif.thunk";

const Comment = () => {
  const [oneTime, setOneTime] = useState(true);
  const [loadContent, setLoadContent] = useState(false);
  const [deleteMoreModal, setDeleteMoreModal] = useState(false);
  const [dataChecked, setDataChecked] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const blogComment = useSelector((state: RootState) => (state.blogComment));
  const dispatch = useDispatch<AppDispatch>();

  const onDeleteMore = (index: number = 0) => {
    setSubmitting(true);
    fetch(
      `${api.DASHBOARD_BLOG_COMMENT_DELETE}/${
        blogComment.response?.result.data[dataChecked[index]].uid
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
              ...blogComment.page,
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
            fetchBlogComment({
              page: blogComment.page,
              sort: blogComment.sort,
              filter: blogComment.filter,
              show: [
                "uid",
                "name",
                "comment",
                "leftjoin_content_uid",
                "leftjoin_content_title",
                "leftjoin_created_by_name",
                "created_at",
                "updated_at",
              ],
            })
          );
        }
      })
      .catch((err) => {
        console.log(err);
        setSubmitting(false);
          dispatch(notify({title:"", text: "Something went wrong!", timer:5000}));
      });
  };

  useEffect(() => {
    if (oneTime) {
      setOneTime(false);
      if (!!!blogComment.response) {
        setLoadContent(true);
      }
    }
  }, [blogComment.response, oneTime]);

  useEffect(() => {
    if (loadContent) {
      setLoadContent(false);
      dispatch(
            fetchBlogComment({
              page: blogComment.page,
              sort: blogComment.sort,
              filter: blogComment.filter,
              show: [
                "uid",
                "name",
                "comment",
                "leftjoin_content_uid",
                "leftjoin_content_title",
                "leftjoin_created_by_name",
                "created_at",
                "updated_at",
              ],
            })
      );
    }
  }, [
    blogComment.filter,
    blogComment.page,
    blogComment.sort,
    dispatch,
    loadContent,
  ]);

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
        sort={blogComment.sort}
        onSort={(s) => {
          dispatch(setSort([...s]));
          setLoadContent(true);
        }}
        page={blogComment.page}
        totalPage={
          Math.ceil(
            (blogComment.response?.result.total ?? 1) / blogComment.page.size
          ) ?? 1
        }
        onPage={(page) => {
          dispatch(setPage(page));
          setLoadContent(true);
        }}
        filter={blogComment.filter}
        onFilter={(f) => {
          dispatch(setFilter(f));
          setLoadContent(true);
        }}
        check={dataChecked}
        onCheckChange={(keys) => {
          setDataChecked(keys);
        }}
        data={!!blogComment.response ? blogComment.response.result.data : []}
        columns={[
          { name: "Name", field: "name", sortable: true, searchable: true },
          {
            name: "Comment",
            field: "comment",
            sortable: true,
            searchable: true,
          },
          {
            name: "Commented on",
            field: "leftjoin_content_title",
            sortable: true,
            searchable: true,
          },
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
        ]}
        loading={blogComment.loading}
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

export default Comment;
