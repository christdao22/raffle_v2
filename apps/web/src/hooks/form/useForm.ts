import { type ChangeEvent, useState } from "react";

type FormValue = string | number | boolean | null | undefined | readonly string[];

export function useForm<T extends Record<string, FormValue>>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);

  const setValue = <K extends keyof T>(name: K, value: T[K]) => {
    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
  };

  const register = <K extends keyof T>(name: K) => {
    const fieldValue = values[name];

    return {
      name: String(name),
      value: fieldValue as T[K],
      onChange: (
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
      ) => {
        const rawValue = event.target.value;
        const nextValue =
          typeof fieldValue === "number" ? (Number(rawValue) as T[K]) : (rawValue as T[K]);

        setValue(name, nextValue);
      },
    };
  };

  const reset = (nextValues: T = initialValues) => {
    setValues(nextValues);
  };

  return { values, setValue, register, reset };
}
