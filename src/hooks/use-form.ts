import { ZodSchema } from "zod";
import validateFormData from "@/utils/forms/validate-form-data";
import hasChanges from "@/utils/forms/check-for-changes";
import hasDuplicateTitle from "@/utils/forms/check-for-duplicates";
import useAutoFocusOnError from "./use-auto-focus-on-error";
import useErrorManagement from "./use-error-management";
import useFormValues from "./use-form-values";
import type { FormErrors } from "@/lib/types";

const useForm = <
  T extends Record<string, unknown>,
  V extends Record<string, unknown> = T,
>(
  initialState: T,
  schema: ZodSchema<V>,
) => {
  const {
    errors,
    setSpecificError,
    setGenericError,
    setValidationErrors,
    clearFieldError,
    clearGenericError,
  } = useErrorManagement<T>();

  const { formValues, handleOnChange } = useFormValues<T>({
    initialState,
    onFieldChange: (field) => {
      if (errors?.[field]) clearFieldError(field);
      if (errors?.generic) clearGenericError();
    },
  });

  const validateBeforeSubmit = (
    formData: FormData,
    isEditMode: boolean,
    existingItems: { id: string; title: string }[],
    subsetFields: (keyof T)[],
    entityType: "board" | "task" = "board",
  ) => {
    const {
      success,
      data: validatedData,
      error,
    } = validateFormData<V>(formData, schema);
    if (!success) {
      console.error("Validation error:", error);

      const validationErrors: Record<string, string> = {};

      for (const issue of error.issues) {
        const field = issue.path[0];
        if (typeof field === "string") {
          if (!validationErrors[field]) {
            validationErrors[field] = issue.message;
          }
        } else if (!validationErrors.generic) {
          validationErrors.generic = issue.message;
        }
      }

      setValidationErrors(validationErrors as FormErrors<T>);
      return { success: false };
    }

    // Check for duplicates (only if `existingItems` is provided)
    if (
      existingItems &&
      hasDuplicateTitle(
        validatedData.title as string,
        existingItems,
        initialState.id as string,
      )
    ) {
      setSpecificError(
        "title",
        `A ${entityType} with the name "${validatedData.title}" already exists.`,
      );
      return {
        success: false,
      };
    }

    // Check if changes were actually made
    if (
      isEditMode &&
      !hasChanges(initialState, validatedData as Partial<T>, subsetFields)
    ) {
      setGenericError(
        "No changes detected. Please update something before submitting.",
      );

      return { success: false };
    }

    return { success: true, data: validatedData };
  };

  const formRef = useAutoFocusOnError<T>(errors, {
    delay: 300,
  });

  return {
    formValues,
    handleOnChange,
    errors,
    setSpecificError,
    setGenericError,
    formRef,
    validateBeforeSubmit,
  };
};

export default useForm;
