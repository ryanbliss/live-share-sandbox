import {
  Input,
  InputOnChangeData,
  Label,
  useId,
} from "@fluentui/react-components";
import { FC, useCallback } from "react";
import { FlexColumn } from "../flex";

interface IFormTextFieldProps {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  onChange: (value: string) => void;
}

export const FormTextField: FC<IFormTextFieldProps> = ({
  id,
  label,
  value,
  placeholder,
  required,
  onChange,
}) => {
  const inputId = useId(id);
  const onValueChange = useCallback(
    (ev: any, data: InputOnChangeData) => {
      onChange(data.value);
    },
    [onChange]
  );
  return (
    <FlexColumn>
      <Label htmlFor={inputId} required={required}>
        {label}
      </Label>
      <Input
        id={inputId}
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={onValueChange}
      />
    </FlexColumn>
  );
};
