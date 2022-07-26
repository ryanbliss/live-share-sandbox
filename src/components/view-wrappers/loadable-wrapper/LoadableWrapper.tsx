import { Spinner } from "@fluentui/react-components";
import { ReactNode, FC } from "react";
import { FlexColumn } from "../../flex";

interface IPageWrapperProps {
  children: ReactNode;
  loading: boolean;
  error: Error | undefined;
}
export const LoadableWrapper: FC<IPageWrapperProps> = (props) => {
  if (props.error) {
    return (
      <FlexColumn expand="fill" vAlign="center" hAlign="center">
        {props.error.message}
      </FlexColumn>
    );
  }
  if (props.loading) {
    return (
      <FlexColumn expand="fill" vAlign="center" hAlign="center">
        <Spinner />
      </FlexColumn>
    );
  }
  return (
    <FlexColumn expand="fill" style={{ maxHeight: "100vh" }}>
      {props.children}
    </FlexColumn>
  );
};
