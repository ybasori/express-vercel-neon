import {
  setPage,
  setSort,
} from "@src/_states/reducers/blogContent/blogContent.slice";
import {
  fetchBlogContent,
} from "@src/_states/reducers/blogContent/blogContent.thunk";
import { notify } from "@src/_states/reducers/notif/notif.thunk";
import useForm, { ICallbackSubmit } from "@src/hooks/useForm";
import * as yup from "yup";
import { ICreateEdit } from "./CreateEdit.type";
import { useCallback, useEffect, useState } from "react";
import { api } from "../../../../../../../../_config/config";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@src/_states/store";
import { RootState } from "@src/_states/types";
import { useHistory, useParams } from "react-router-dom";

const CreateEdit: React.FC<ICreateEdit> = ({ isEdit }) => {
  const [oneTime, setOneTime] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const blogContent = useSelector((state:RootState)=>(state.blogContent));
  const {uid} = useParams<{uid: string}>();
  const dispatch = useDispatch<AppDispatch>();
  const history = useHistory();

  const validation = () => {
    return yup.object().shape({
      title: yup.string().required("Title is required!"),
      content: yup.string().required("Content is required!"),
    });
  };

  const {
    handleSubmit,
    errors,
    values,
    handleReset,
    isSubmitting,
    isValid,
    handleChange,
    setDefaultForm,
    setFieldValue,
  } = useForm({
    initialValues: {
      title: "",
      content: "",
    },
    validation: validation(),
  });

  const onGetCategory = useCallback(() => {
    fetch(`${api.DASHBOARD_BLOG_CATEGORY_LIST}?show[]=uid&show[]=name`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setCategories([...data.result.data]);
      })
      .catch(() => {
        dispatch(notify({title:"", text:"Something went wrong!", timer:5000}));
      });
  }, [dispatch]);

  const onGetTag = useCallback(() => {
    fetch(`${api.DASHBOARD_BLOG_TAG_LIST}?show[]=uid&show[]=name`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setTags([...data.result.data]);
      })
      .catch(() => {
        dispatch(notify({title:"", text:"Something went wrong!", timer:5000}));
      });
  }, [dispatch]);

  const onInitialValue = useCallback(() => {
    fetch(
      `${api.DASHBOARD_BLOG_CONTENT_LIST}?filter[uid]=${uid}&show[]=uid&show[]=title&show[]=content&show[]=leftJoin_category_uid`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        const [detail] = data.result.data;
        if (detail) {
          setDefaultForm({
            ...detail,
            category_uid: detail.leftJoin_category_uid,
            tag_uid: detail.content_tag.data.map((item:{tag:{uid:string; name:string;}})=>({value: item.tag.uid, label: item.tag.name}))
          });
        }
      })
      .catch(() => {
        dispatch(notify({title:"", text:"Something went wrong!", timer:5000}));
      });
  }, [dispatch, uid, setDefaultForm]);

  const onSubmit: ICallbackSubmit = (values, { setSubmitting }) => {
    fetch(
      `${isEdit ? `${api.DASHBOARD_BLOG_CONTENT_UPDATE}/${uid}` : `${api.DASHBOARD_BLOG_CONTENT_CREATE}`}`,
      {
        method: `${isEdit ? "PUT" : "POST"}`,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          tag_uid: [
            ...(values.tag_uid??[]).map((item: { value: string }) => item.value),
          ],
        }),
      }
    )
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setSubmitting(false);
        dispatch(notify({title:"", text:data.message, timer:5000}));
        if (data.statusCode === 200) {
          dispatch(
            setPage({
              ...blogContent.page,
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
            fetchBlogContent(
              {page:blogContent.page,
              sort:blogContent.sort,
              filter:blogContent.filter,
              show:[
                "uid",
                "title",
                "created_at",
                "updated_at",
                "leftJoin_category_name",
              ]}
            )
          );
          history.push("/dashboard/blog/content");
        }
      })
      .catch(() => {
        setSubmitting(false);
        dispatch(notify({title:"", text:"Something went wrong!", timer:5000}));
      });
  };

  useEffect(() => {
    if (oneTime) {
      setOneTime(false);
      if (isEdit) {
        onInitialValue();
      }
      onGetCategory();
      onGetTag();
    }
  }, [onInitialValue, oneTime, isEdit, onGetCategory, onGetTag]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="field">
        <label className="label">Title</label>
        <div className={`control ${!!errors.title ? `has-icons-right` : ``}`}>
          <input
            className={`input ${!!errors.title ? `is-danger` : ``}`}
            type="text"
            placeholder="Title"
            name="title"
            onChange={handleChange}
            disabled={isSubmitting}
            value={values.title}
          />
          {!!errors.title ? (
            <span className="icon is-small is-right">
              <i className="fas fa-exclamation-triangle"></i>
            </span>
          ) : null}
        </div>
        {!!errors.content ? (
          <p className="help is-danger">{errors.title}</p>
        ) : null}
      </div>

      <div className="field">
        <label className="label">Category</label>
        <div className="select">
          <select
            name="category_uid"
            onChange={handleChange}
            value={values.category_uid}
          >
            <option value="">--empty--</option>
            {categories.map((item, key) => (
              <option key={key} value={item.uid}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="field">
        <label className="label">Tag</label>
        <div className={`control `}>
          {(values?.tag_uid ?? []).map(
            (item: { label: string; value: string }, key: number) => (
              <span className="tag is-success" key={key}>
                {item.label}
                <button
                  className="delete is-small"
                  type="button"
                  onClick={() =>
                    setFieldValue("tag_uid", [
                      ...values.tag_uid.filter(
                        (e: { value: string }) => e.value !== item.value
                      ),
                    ])
                  }
                ></button>
              </span>
            )
          )}
        </div>
        <div className="select">
          <select
            name="tag_uid"
            onChange={(e) => {
              setFieldValue("tag_uid", [
                ...(values?.tag_uid ?? []),
                {
                  value: e.currentTarget.value,
                  label: tags.find((item) => item.uid === e.currentTarget.value)
                    .name,
                },
              ]);
            }}
            value={""}
          >
            <option value="">--empty--</option>
            {tags
              .filter(
                (item) =>
                  (values.tag_uid ?? []).findIndex(
                    (sitem: { value: string }) => sitem.value === item.uid
                  ) < 0
              )
              .map((item, key) => (
                <option key={key} value={item.uid}>
                  {item.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label className="label">Content</label>
        <div className={`control ${!!errors.content ? `has-icons-right` : ``}`}>
          <textarea
            className={`textarea ${!!errors.content ? `is-danger` : ``}`}
            placeholder="Content"
            name="content"
            onChange={handleChange}
            disabled={isSubmitting}
            value={values.content}
          ></textarea>
        </div>
        {!!errors.content ? (
          <p className="help is-danger">{errors.content}</p>
        ) : null}
      </div>

      <div className="field is-grouped">
        <div className="control">
          <button
            className="button is-link"
            type={"submit"}
            disabled={isSubmitting || !isValid}
          >
            {isSubmitting ? "Wait..." : true ? "Save Changes" : "Edit"}
          </button>
        </div>
        <div className="control">
          <button
            className="button is-link is-light"
            type={"button"}
            disabled={isSubmitting}
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      </div>
    </form>
  );
};

export default CreateEdit;
