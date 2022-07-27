import { FC, ReactNode } from "react";
import { LiveShareContext, useLiveShareData } from "../internals";
import { LoadableWrapper } from "../../../components/view-wrappers";

export const LiveShareProvider: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const liveShareValue = useLiveShareData();

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
