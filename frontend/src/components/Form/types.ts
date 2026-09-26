export type InputFieldType = "text" | "number" | "boolean" | "select" | "code" | "check"
export type InputFieldCodeSyntax = "json" | "yaml"

export type BaseOptions = {
  required?: boolean
}

export type Options = {
  text: {
    startsWith: string
    length: number
  }
  number: {
    numberRange: [number, number]
  }
  boolean: {
    labels: [string, string]
  }
  select: {
    items: string[]
  }
  code: {
    syntax: InputFieldCodeSyntax
    placeholder: string
  }
  check: {
    labels?: [string, string]
  }
}

export type Value = {
  text: string 
  number: number 
  boolean: boolean 
  check: boolean 
  select: string 
  code: string 
}

export type InputValue<T extends InputFieldType> = Value[T]

export type InputFieldWithType<T extends InputFieldType> = {
  key: string,
  title: string,
  type: T
  default?: Value[T],
  options?: BaseOptions & Options[T]
  tag?: string,
}

export type InputField = {
  [K in InputFieldType]: InputFieldWithType<K>;
}[InputFieldType];

export type FormData = Record<InputField["key"], Value[InputField["type"]]>
export type GroupedFormData = Record<string, Record<InputField["key"], Value[keyof Value]>>;
