// DynamicForm.tsx
import React, { useMemo, useState, useCallback, useEffect } from "react";
import {
  EuiForm,
  EuiButton,
  EuiAccordion,
  EuiPanel,
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButtonIcon,
} from "@elastic/eui";
import { GroupedFormData, InputField, Value } from "./types";
import { DynamicInputFieldComponent } from "./components/InputField";
import { initialFormData } from "./constants";
import { LoadingPrompt } from "../LoadingPrompt";
import { cn } from "../../utils";

type Props = {
  fields: InputField[];
  isLoading?: boolean;
  isInitialOpen?: boolean;
  columns?: 1 | 2 | 3;
  submitText?: string;
  cancelText?: string;
  onSubmit: (formData: GroupedFormData) => void;
  onCancel?: () => void;
  onHelp?: (tag: string) => void;
};

export const DynamicForm = ({
  fields,
  isLoading = false,
  isInitialOpen,
  submitText = 'Submit',
  cancelText = 'Cancel',
  columns = 1,
  onSubmit,
  onCancel,
  onHelp,
}: Props) => {
  const [formState, setFormState] = useState<Map<string, unknown>>(new Map());
  const [errors, setErrors] = useState<Map<string, string | null>>(new Map());
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    const initialState = new Map(
      fields.map((f) => [
        `${f.tag}/${f.key}`,
        f.default !== undefined
          ? f.default
          : f.type === "number"
            ? f.options?.numberRange?.[0]
            : initialFormData[f.type],
      ])
    );
    setFormState(initialState);
  }, [fields]);

  const handleChange = useCallback(
    <T extends string | number | boolean | undefined>(key: string, value: T) => {
      setFormState((prev) => new Map(prev).set(key, value));
      setErrors((prev) => {
        const copy = new Map(prev);
        copy.set(key, null);
        return copy;
      });
    },
    []
  );

  const validateField = useCallback((field: InputField, value: unknown): string | null => {
    if (field?.options?.required && (value === "" || value === undefined || value === null)) {
      return "This field is required";
    }
    if (field.type === "text" && field.options?.length && String(value)?.length > field.options.length) {
      return `Max length is ${field.options.length}`;
    }
    if (field.type === "number") {
      const [min, max] = field.options?.numberRange ?? [undefined, undefined];
      if (min !== undefined && Number(value) < min) return `Minimum is ${min}`;
      if (max !== undefined && Number(value) > max) return `Maximum is ${max}`;
    }
    return null;
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = new Map<string, string | null>();
    const groupsWithError = new Set<string>();

    fields.forEach((field) => {
      const key = `${field.tag}/${field.key}`;
      const err = validateField(field, formState.get(key));
      newErrors.set(key, err);
      if (err) groupsWithError.add(field.tag ?? "General");
    });

    setErrors(newErrors);
    setOpenGroups(groupsWithError);

    return Array.from(newErrors.values()).every((err) => !err);
  }, [fields, formState, validateField]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (validateForm()) {
        const groupedFormData = fields.reduce((acc, field) => {
          const group = field.tag ?? "_";
          if (!acc[group]) acc[group] = {};
          acc[group][field.key] = formState.get(`${field.tag}/${field.key}`) as Value[typeof field.type];
          return acc;
        }, {} as GroupedFormData);
        onSubmit(groupedFormData);
      }
    },
    [fields, formState, onSubmit, validateForm]
  );

  const groupedFields = useMemo(() => {
    return fields.reduce((acc, field) => {
      const group = field.tag ?? "General";
      if (!acc[group]) acc[group] = [];
      acc[group].push(field);
      return acc;
    }, {} as Record<string, InputField[]>);
  }, [fields]);

  const groups = useMemo(() => Object.keys(groupedFields), [groupedFields]);

  return (
    <EuiForm component="form" onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {isLoading ? (
        <LoadingPrompt size="xl" columns={columns} rows={groups.length ?? 1}/>
      ) : (
        groups.map((group, index) => (
            <EuiAccordion
              key={`${group}-${index}-form`}
              id={`accordion-${group}`}
              buttonElement="div"
              buttonContent={
              <div className="w-full h-16 flex justify-center items-center">
                <EuiFlexGroup justifyContent="center" alignItems="center">
                  <EuiFlexItem>
                    <EuiText className="whitespace-nowrap first-letter:uppercase">{group}</EuiText>
                  </EuiFlexItem>
                  {onHelp && (
                    <EuiFlexItem grow={false}>
                      <EuiButtonIcon onClick={() => onHelp(group)} iconType="help" />
                    </EuiFlexItem>
                  )}
                </EuiFlexGroup>
              </div>
            }
            {...(isInitialOpen !== undefined
              ? { forceState: isInitialOpen ? "open" : "closed" }
              : { forceState: openGroups.has(group) ? "open" : "closed" })}
            onToggle={(isOpen) => {
              setOpenGroups((prev) => {
                const next = new Set(prev);
                if (isOpen) next.add(group);
                else next.delete(group);
                return next;
              });
            }}
            initialIsOpen={!index}
          >
            <EuiPanel color="subdued" paddingSize="m">
              <div className={cn(
                "grid gap-4",
                columns === 1 && 'grid-cols-1',
                columns === 2 && 'grid-cols-2',
                columns === 3 && 'grid-cols-3',
              )}>
                {groupedFields[group].map((field, index) => (
                  <DynamicInputFieldComponent
                    key={`${group}-${field.key}-${index}-field`}
                    field={field}
                    value={formState.get(`${field.tag}/${field.key}`) as Value[typeof field.type]}
                    error={errors.get(`${field.tag}/${field.key}`)}
                    onChange={handleChange}
                  />
                ))}
              </div>
            </EuiPanel>
          </EuiAccordion>
        ))
      )}

      {fields.length > 0 && (
        <EuiFlexGroup gutterSize="m">
          <EuiFlexItem grow={false}>
            <EuiButton className="w-32" type="submit" fill>
              {submitText}
            </EuiButton>
          </EuiFlexItem>
          {onCancel && (
            <EuiFlexItem grow={false}>
              <EuiButton onClick={onCancel} className="w-32">
                {cancelText}
              </EuiButton>
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
      )}
    </EuiForm>
  );
};