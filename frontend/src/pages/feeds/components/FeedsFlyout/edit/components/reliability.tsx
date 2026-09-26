import { memo, useEffect, useState } from "react";
import { reliabilityLevel } from "../../../../../../types/feeds";
import { RELIABILITY_LEVELS } from "../../../../../../constants/feeds";
import { EuiButtonIcon, EuiFlexGroup, EuiFlexItem, EuiSelect, EuiText } from "@elastic/eui";

const ReliabilityLevelEditorComponent = ({
  initialValue,
  onSave,
}: {
  initialValue: reliabilityLevel;
  onSave: (val: reliabilityLevel) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);

  useEffect(() => setValue(initialValue), [initialValue]);

  const saveValue = () => {
    setIsEditing(false);
    if (value !== initialValue) onSave(value);
  };

  const options = RELIABILITY_LEVELS.map((item) => ({
    value: item,
    text: item
  }))

  return (
    <EuiFlexGroup alignItems="center" gutterSize="s">
      <EuiFlexItem grow={false} style={{ minWidth: 200 }}>
        {isEditing ? (
          <EuiSelect
            compressed
            options={options}
            value={value}
            onChange={(e) => setValue(e.target.value as reliabilityLevel)}
            autoFocus
          />
        ) : (
          <EuiText>{value}</EuiText>
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

export const ReliabilityLevelEditor = memo(ReliabilityLevelEditorComponent)