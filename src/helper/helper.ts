const onArrayForm = (name: string, data: { [x: string]: any; }, obj: {label: string; value: string}[]) => {
    let newObj: {label: string; value: string}[] = [...obj];
    for (const key in data) {
      if (
        (Array.isArray(data[key]) || typeof data[key] === "object") &&
        !(data[key] instanceof File)
      ) {
        newObj = onArrayForm(`${name}[${key}]`, data[key], newObj);
      } else {
        newObj = [...newObj, { label: `${name}[${key}]`, value: data[key] }];
      }
    }
    return newObj;
  };

export const expandJSON = (data: { [x: string]: any; }) => {
    let obj: {label: string; value: string}[] = [];
    for (const key in data) {
      if (
        Array.isArray(data[key]) ||
        (typeof data[key] === "object" && !(data[key] instanceof File))
      ) {
        obj = onArrayForm(`${key}`, data[key], obj);
      } else {
        obj = [
          ...obj,
          {
            label: key,
            value: data[key],
          },
        ];
      }
    }
    return obj;
  };