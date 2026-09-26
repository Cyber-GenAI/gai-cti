import { InputFieldType, Value } from "../types";

export const initialFormData: Record<InputFieldType, Value[InputFieldType]> = {
  boolean: false,
  check: false,
  number: 0,
  select: '',
  text: '',
  code: '',
  }