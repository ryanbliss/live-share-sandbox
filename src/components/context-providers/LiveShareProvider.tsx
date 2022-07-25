import { FC, ReactNode } from "react";
import {
  LiveShareContext,
  useLiveShare,
} from "../../live-share-hooks/useLiveShare";
import PageWrapper from "../page-wrapper/PageWrapper";

export const LiveShareProvider: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const liveShareValue = useLiveShare();

  return (
    <LiveShareContext.Provider value={liveShareValue}>
      <PageWrapper
        loading={liveShareValue.loading}
        error={liveShareValue.error}
      >
        {children}
      </PageWrapper>
    </LiveShareContext.Provider>
  );
};
