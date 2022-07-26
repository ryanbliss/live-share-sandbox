import { FC, ReactNode } from "react";
import { LiveShareContext, useLiveShare } from "../../../hooks";
import { LoadableWrapper } from "../../view-wrappers";

export const LiveShareProvider: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const liveShareValue = useLiveShare();

  return (
    <LiveShareContext.Provider value={liveShareValue}>
      <LoadableWrapper
        loading={liveShareValue.loading}
        error={liveShareValue.error}
      >
        {children}
      </LoadableWrapper>
    </LiveShareContext.Provider>
  );
};
