import { ChangeEvent, FC, useCallback, useState } from "react";
import {
  Button,
  Input,
  InputOnChangeData,
  Label,
  Popover,
  PopoverProps,
  PopoverSurface,
  PopoverTrigger,
  useId,
} from "@fluentui/react-components";
import { AddCircle24Filled } from "@fluentui/react-icons";
import { FlexColumn } from "../../flex";

interface IAddPopover {
  title: string;
  placeholder?: string;
  icon?: JSX.Element;
  onDone: (arg0: string) => void;
}

export const TextInputPopover: FC<IAddPopover> = ({
  title,
  placeholder,
  icon,
  onDone,
}) => {
  const inputId = useId("input-with-placeholder");
  const [inputValue, setInputValue] = useState<string>("");

  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);
  const handleOpenChange: PopoverProps["onOpenChange"] = (e, data) =>
    setPopoverOpen(data.open || false);

  const onInputChange = useCallback(
    (ev: ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
      setInputValue(data.value);
    },
    [setInputValue]
  );

  const onClickDone = useCallback(() => {
    onDone(inputValue);
    setPopoverOpen(false);
  }, [inputValue, onDone]);

  return (
    <Popover trapFocus open={popoverOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger>
        <Button
          icon={icon ?? <AddCircle24Filled />}
          appearance={"subtle"}
        ></Button>
      </PopoverTrigger>

      <PopoverSurface>
        <FlexColumn marginSpacer="small">
          <Label htmlFor={inputId}>{title}</Label>
          <Input
            placeholder={placeholder ?? "Enter a value..."}
            id={inputId}
            onChange={onInputChange}
          />
          <Button onClick={onClickDone}>{`Done`}</Button>
        </FlexColumn>
      </PopoverSurface>
    </Popover>
  );
};
