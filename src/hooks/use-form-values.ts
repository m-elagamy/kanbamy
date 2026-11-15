import { debounce } from "@/utils/timing";
import { useState } from "react";

type UseFormControlProps<T> = {
  initialState: T;
  onFieldChange?: (field: keyof T) => void;
  delay?: number;
};

const useFormValues = <T extends Record<string, unknown>>({
  initialState,
  onFieldChange,
  delay = 300,
}: UseFormControlProps<T>) => {
  const [formValues, setFormValues] = useState<T>(initialState);

  const handleOnChange = debounce((field: keyof T, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value.trim(),
    }));
    onFieldChange?.(field);
  }, delay);

  return {
    formValues,
    handleOnChange,
  };
};

export default useFormValues;
