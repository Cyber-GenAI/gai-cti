import React, { useState, useEffect } from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiFieldText, EuiText, EuiButtonIcon } from '@elastic/eui';

const IntervalLevelEditor = ({
  initialValue,
  onSave,
}: {
  initialValue: string;
  onSave: (val: string) => Promise<boolean>;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const commitSave = async () => {
    if (value === initialValue) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      const success = await onSave(value);
      if (success) {
        setIsEditing(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    setValue(initialValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitSave();
    }
    if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  return (
    <EuiFlexGroup alignItems="center" gutterSize="s">
      <EuiFlexItem grow={false}>
        {isEditing ? (
          <EuiFieldText
            compressed
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            disabled={isSaving}
          />
        ) : (
          <EuiText size="s">{value}</EuiText>
        )}
      </EuiFlexItem>

      <EuiFlexItem grow={false}>
        <EuiButtonIcon
          size="xs"
          iconType={isEditing ? (isSaving ? 'loading' : 'check') : 'pencil'}
          aria-label={isEditing ? 'save' : 'edit'}
          onClick={() => (isEditing ? commitSave() : setIsEditing(true))}
          disabled={isSaving}
          isLoading={isSaving}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default IntervalLevelEditor;