import { EuiBadge, EuiButtonIcon, EuiFieldText, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import { memo, useEffect, useState } from "react";

const ConfidenceLevelEditorComponent = ({
  initialValue,
  onSave,
}: {
  initialValue: number;
  onSave: (val: number) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);

  useEffect(() => setValue(initialValue), [initialValue]);

  const saveValue = () => {
    setIsEditing(false);
    if (value !== initialValue) onSave(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") saveValue();
    if (e.key === "Escape") {
      setValue(initialValue);
      setIsEditing(false);
    }
  };

  return (
    <EuiFlexGroup alignItems="center" gutterSize="s">
      <EuiFlexItem grow={false}>
        {isEditing ? (
          <EuiFieldText
            compressed
            type="number"
            value={value}
            onChange={(e) =>
              setValue(Math.min(Math.max(Number(e.target.value), 0), 100))
            }
            onKeyDown={handleKeyDown}
            autoFocus
          />
        ) : (
          <EuiBadge
            color={`rgba(77, 210, 202, ${(value / 100) * 1.15})`}
            className="!z-10"
          >
            {String(value)}
          </EuiBadge>
        )}
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiButtonIcon
          size="xs"
          iconType={isEditing ? "check" : "pencil"}
          aria-label={isEditing ? "save" : "edit"}
          onClick={() => (isEditing ? saveValue() : setIsEditing(true))}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export const ConfidenceLevelEditor = memo(ConfidenceLevelEditorComponent)