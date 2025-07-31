import { notify } from "@src/_states/reducers/notif/notif.thunk";
import useForm, { ICallbackSubmit } from "@src/hooks/useForm";
import * as yup from "yup";
import { ITagCreateEdit } from "./TagCreateEdit.type";
import { useCallback, useEffect, useState } from "react";
import {
  setPage,
  setSort,
} from "@src/_states/reducers/blogTag/blogTag.slice";
import {
  fetchBlogTag,
} from "@src/_states/reducers/blogTag/blogTag.thunk";
import { api } from "../../../../../../../_config/config";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@src/_states/store";
import { RootState } from "@src/_states/types";
import { useHistory, useParams } from "react-router-dom";

const TagCreateEdit: React.FC<ITagCreateEdit> = ({ isEdit }) => {
  const [oneTime, setOneTime] = useState(isEdit);
  const blogTag = useSelector((state:RootState)=>(state.blogTag));
  const {uid} = useParams<{uid:string}>()
  const dispatch = useDispatch<AppDispatch>();
  const history = useHistory();

  const validation = () => {
    return yup.object().shape({
      name: yup.string().required("Name is required!"),
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
  } = useForm({
    initialValues: {
      name: "",
    },
    validation: validation(),
  });

  const onInitialValue = useCallback(() => {
    fetch(
      `${api.DASHBOARD_BLOG_TAG_LIST}?filter[uid]=${uid}&show[]=uid&show[]=name`,
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
          setDefaultForm(detail);
        }
      })
      .catch(() => {
        dispatch(notify({title:"", text:"Something went wrong!", timer:5000}));
      });
  }, [dispatch, uid, setDefaultForm]);

  const onSubmit: ICallbackSubmit = (values, { setSubmitting }) => {
    fetch(
      `${isEdit ? `${api.DASHBOARD_BLOG_TAG_UPDATE}/${uid}` : `${api.DASHBOARD_BLOG_TAG_CREATE}`}`,
      {
        method: `${isEdit ? "PUT" : "POST"}`,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
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
            fetchBlogTag({
              page:blogTag.page,
              sort:blogTag.sort,
              filter:blogTag.filter,
              show:["uid", "name", "created_at", "updated_at"]
            })
          );
          history.push("/dashboard/blog/tag");
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
      onInitialValue();
    }
  }, [onInitialValue, oneTime]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="field">
        <label className="label">Name</label>
        <div className={`control ${!!errors.name ? `has-icons-right` : ``}`}>
          <input
            className={`input ${!!errors.name ? `is-danger` : ``}`}
            type="text"
            placeholder="Name"
            name="name"
            onChange={handleChange}
            disabled={isSubmitting}
            value={values.name}
          />
          {!!errors.name ? (
            <span className="icon is-small is-right">
              <i className="fas fa-exclamation-triangle"></i>
            </span>
          ) : null}
        </div>
        {!!errors.name ? (
          <p className="help is-danger">{errors.name}</p>
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

export default TagCreateEdit;
