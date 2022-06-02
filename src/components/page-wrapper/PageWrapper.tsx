import { ReactNode, FC } from "react";

interface IPageWrapperProps {
  children: ReactNode;
  loading: boolean;
  error: Error | undefined;
}
const PageWrapper: FC<IPageWrapperProps> = (props) => {
  if (props.error) {
    return <div>{props.error.message}</div>;
  }
  if (props.loading) {
    return <div>{"Loading"}</div>;
  }
  return <div>{props.children}</div>;
};

export default PageWrapper;
