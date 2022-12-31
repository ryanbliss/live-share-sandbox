import {
  Label,
  Radio,
  RadioGroup,
  RadioGroupOnChangeData,
  useId,
} from "@fluentui/react-components";
import { FC, useCallback } from "react";
import { IRadioItem } from "../../models";
import { FlexColumn } from "../flex";

interface IFormChange {}

interface IFormRadioGroupProps {
  id: string;
  title: string;
  required?: boolean;
  selectedValue?: string;
  radioItems: IRadioItem[];
  disabled?: boolean;
  onChange: (value: string) => void;
}

export const FormRadioGroup: FC<IFormRadioGroupProps> = ({
  id,
  title,
  required,
  selectedValue,
  radioItems,
  disabled,
  onChange,
}) => {
  const labelId = useId(`label-${id}`);

  const onValueChange = useCallback(
    (ev: any, data: RadioGroupOnChangeData) => {
      const value = data.value;
      onChange(value);
    },
    [onChange]
  );

  return (
    <FlexColumn>
      <Label id={labelId} required={required}>
        {title}
      </Label>
      <RadioGroup
        aria-labelledby={labelId}
        required={required}
        value={selectedValue}
        disabled={disabled}
        onChange={onValueChange}
      >
        {radioItems.map((item) => (
          <Radio
            key={`radio-item-${item.value}`}
            value={item.value}
            label={item.label}
          />
        ))}
      </RadioGroup>
    </FlexColumn>
  );
};
