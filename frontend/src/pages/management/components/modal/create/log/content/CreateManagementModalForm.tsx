import { memo, useState, useCallback, ChangeEvent, FormEvent } from 'react'
import { EuiButton, EuiFieldText, EuiFilePicker, EuiFlexGroup, EuiFlexItem, EuiForm, EuiFormRow, EuiSpacer } from '@elastic/eui'

interface ICreateManagementModalFormProps {
  handleCloseModal: () => void;
  handleSubmit: (data: { name: string; file: File }) => void;
}

const CreateManagementModalFormComponent = ({
  handleCloseModal,
  handleSubmit,
}: ICreateManagementModalFormProps) => {
  const [name, setName] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  const onNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);

  const onFileChange = useCallback((files: FileList | File[] | null) => {
    if (files && files.length > 0) {
      const selectedFile = files[0];
      if (selectedFile.name.endsWith('.ndjson')) {
        setFile(selectedFile);
      } else {
        setFile(null);
        alert('Please select a .ndjson file');
      }
    } else {
      setFile(null);
    }
  }, []);

  const onSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (name && file) {
      handleSubmit({
        name,
        file,
      })
    }
  }, [file, handleSubmit, name])

  return (
    <EuiForm onSubmit={onSubmit} fullWidth component="form" className='!py-4'>
      <EuiFormRow isInvalid={name.length ? !/^[a-z0-9-]+$/.test(name) : false} error="Username must contain only lowercase letters (a–z), numbers (0–9), and hyphens (-)." fullWidth label="Name">
        <EuiFieldText
          fullWidth
          prepend={"log-manual-"}
          name="name"
          aria-label="Example"
          value={name}
          placeholder='Management name'
          onChange={onNameChange}
          required
        />
      </EuiFormRow>
      <EuiFormRow label="File">
        <EuiFilePicker
          fullWidth
          accept=".ndjson"
          onChange={onFileChange}
          multiple={false}
          required
        />
      </EuiFormRow>

      <EuiSpacer />

      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiButton onClick={handleCloseModal}>Close</EuiButton>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiButton type='submit' fill>
            Create
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiForm>
  )
}

export const CreateManagementModalForm = memo(CreateManagementModalFormComponent)