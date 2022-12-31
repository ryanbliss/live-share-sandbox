import { FC } from "react";
import { Outlet } from "react-router-dom";
import { CodeboxLiveProvider } from "../../context-providers";

export const HomePage: FC = () => {
  return (
    <CodeboxLiveProvider>
      <Outlet />
    </CodeboxLiveProvider>
  );
};
