import { FC, ReactNode } from "react";
import { FlexColumn, FlexItem } from "../flex";

interface IScrollWrapperProps {
  children?: ReactNode;
}

export const ScrollWrapper: FC<IScrollWrapperProps> = ({ children }) => {
  return (
    <FlexColumn scroll>
      <FlexItem noShrink>{children}</FlexItem>
    </FlexColumn>
  );
};
