import { FormEvent, useState } from "react";
import yup from "yup";


interface IProps{
  initialValues: any;
  validation?: yup.ObjectSchema<any> | null
}

export type ICallbackSubmit = (values:any, config:{setSubmitting:(bool:boolean)=>void})=>void;

const useForm = ({ initialValues, validation = null }:IProps) => {
  // const [form, dispatch] = useReducer(reducer, initialValues);
  const [form, setForm] = useState(initialValues);
  const [defaultForm, setDefaultForm] = useState(initialValues);

  const [isFormTouched, setIsFormTouched] = useState<string[]>([]);
  // const [isSubmitTouched, setIsSubmitTouched] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [errForm, setErrForm] = useState<{[field:keyof typeof initialValues]:any}>({});

  const [isValid, setIsValid] = useState(validation === null ? true : false);

  const handleValidation = (
    currentForm:any,
    touched = isFormTouched,
    cb:(res:{[field:string]:string}|null)=>void = () => null
  ) => {

    if (validation !== null) {
      validation
        .validate(currentForm, { abortEarly: false })
        .then(() => {
          setErrForm({});
          cb(null);
        })
        .catch((err) => {
          let errin = {};
          (!!err.inner ? err.inner : []).forEach((item: { path: string; message: string; }) => {
            errin = { ...errin, [item.path]: item.message };
          });
          let touchError = {};

          setErrForm(() => {
            touched.forEach((item) => {
              touchError = { ...touchError, [item]: errin[item as keyof typeof errin] }
            });

            return { ...touchError }
          })
          cb(touchError);
        });
    }
    else {
      cb(null);
    }
  };


  const handleFieldValue = (field: string, value: any) => {
    // dispatch({
    //   type: "SET_FORM",
    //   payload: {
    //     field,
    //     value,
    //   },
    // });
    setIsFormTouched((prev) => {
      const touched = prev.findIndex((item) => item === field) < 0
        ? [...prev, field]
        : [...prev];

      setForm((prev:any) => {
        const currentForm = { ...prev, [field]: value };
        handleValidation(currentForm, touched, (err) => {
          if (!!!err) {
            setIsValid(true);
          } else {
            setIsValid(false);
          }
        });
        return currentForm;
      });

      return touched;
    }
    );

  };

  const handleSubmit = (cb:ICallbackSubmit) => (e:FormEvent) => {
    e.preventDefault();
    handleValidation(form, [], (err) => {
      if (!!!err) {
        setSubmitting(true);
        cb(form, { setSubmitting });
      }
    });
  };

  const handleReset = () => {
    setForm({...defaultForm});
  };

  
  const handleDefault = (value:any) => {
    setForm(value);
    setDefaultForm(value);
  };


  const handleChange = (e:React.ChangeEvent<any>) => {
    handleFieldValue(e.currentTarget.name, e.currentTarget.value);
  };

  return {
    handleSubmit,
    errors: errForm,
    setFieldValue: handleFieldValue,
    values: form,
    handleReset,
    isSubmitting,
    isValid,
    handleChange,
    setDefaultForm: handleDefault,
  } as const;
};

export default useForm;