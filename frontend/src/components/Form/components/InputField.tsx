import React, { useCallback } from "react";
import {
  EuiFieldText,
  EuiFieldNumber,
  EuiSwitch,
  EuiSelect,
  EuiFormRow,
  EuiText,
  EuiTextArea,
  EuiCheckbox,
  EuiBadge,
  EuiFlexGroup,
  EuiFlexItem,
} from "@elastic/eui";
import { InputFieldType, InputFieldWithType, InputValue, Options } from "../types";

type DynamicInputFieldProps<T extends InputFieldType> = {
  field: InputFieldWithType<T>;
  value: InputValue<T>;
  error?: string | null;
  onChange: (key: string, value: InputValue<T>) => void;
};

export const DynamicInputFieldComponent = React.memo(
  <T extends InputFieldType>({
    field,
    value,
    error,
    onChange,
  }: DynamicInputFieldProps<T>) => {

    const handleChange = useCallback(
      (val: InputValue<T>) => {
        onChange(`${field.tag}/${field.key}`, val as InputValue<T>);
      }, [field.key, field.tag, onChange]);

    return (
      <div className="mb-4">
        <EuiFormRow
          fullWidth
          isInvalid={!!error}
          error={error}
          label={field.type !== 'check' &&
            <EuiText>
              {field.title}
              <EuiText color="success" component="span">
                {field.options?.required ? " *" : ""}
              </EuiText>
            </EuiText>
          }
        >
          {(() => {
            switch (field.type) {
              case "text": {
                const opts = field.options as Options["text"] | undefined;
                return (
                  <EuiFieldText
                    fullWidth
                    isInvalid={!!error}
                    value={value as string ?? ''}
                    maxLength={opts?.length}
                    required={field.options?.required}
                    prepend={opts?.startsWith}
                    placeholder={`${field.title}...`}
                    onChange={(e) => handleChange(e.target.value as InputValue<T>)}
                  />
                );
              }
              case "number": {
                const opts = field.options as Options["number"] | undefined;
                return (
                  <EuiFieldNumber
                    fullWidth
                    isInvalid={!!error}
                    value={value as number | undefined}
                    placeholder={`${field.title}...`}
                    required={field.options?.required}
                    min={opts?.numberRange?.[0]}
                    max={opts?.numberRange?.[1]}
                    onChange={(e) => handleChange(e.target.value as InputValue<T>)}
                  />
                );
              }
              case "boolean": {
                const opts = field.options as Options["boolean"] | undefined;
                return (
                  <EuiSwitch
                    label={(opts?.labels?.[Number(Boolean(value))]) ?? ""}
                    checked={!!value}
                    onChange={(e) => handleChange(e.target.checked as InputValue<T>)}
                  />
                );
              }
              case "select": {
                const opts = field.options as Options["select"] | undefined;
                return (
                  <EuiSelect
                    fullWidth
                    isInvalid={!!error}
                    options={(opts?.items ?? []).map((item) => ({ value: item, text: item }))}
                    hasNoInitialSelection
                    required={field.options?.required}
                    value={(value as string) ?? ""}
                    onChange={(e) => handleChange(e.target.value as InputValue<T>)}
                  />
                );
              }

              case "check": {
                const opts = field.options as Options["check"] | undefined;

                return (
                  <EuiFlexGroup alignItems="center" gutterSize="s">
                    <EuiFlexItem grow={false}>
                      <EuiCheckbox
                        id={`${field.tag}-${field.key}-check`}
                        label={field.title}
                        checked={!!value}
                        onChange={(e) => handleChange(e.target.checked as InputValue<T>)}
                      />
                    </EuiFlexItem>
                    {
                      opts?.labels?.[0] &&
                      <EuiFlexItem grow={false}>
                        <EuiBadge color="primary">{opts?.labels?.[0]}</EuiBadge>
                      </EuiFlexItem>
                    }
                  </EuiFlexGroup>
                );
              }
              case "code": {
                const opts = field.options as Options["code"] | undefined


                return (
                  <EuiTextArea
                    value={value as string ?? ''}
                    fullWidth onChange={(e) => handleChange(e.target.value as InputValue<T>)}
                    required={field.options?.required}
                    placeholder={opts?.placeholder}
                  />
                )
              }
              default:
                return null;
            }
          })() ?? <></>}
        </EuiFormRow>
      </div>
    );
  },
  (prev, next) => prev.value === next.value && prev.error === next.error
);
