import { useCallback, useMemo, useState } from "react";
import { useLiveShareContext } from "../../../../live-share-provider";

export function useCurrentCodePage(): {
  currentPageKey: string | undefined;
  onChangeSelectedFile: (currentPageKey: string | undefined) => void;
} {
  const [localCurrentPageKey, setLocalCurrentPageKey] = useState<string>();
  const {
    currentPageKey: liveShareCurrentPage,
    onChangeSelectedFile: onChangeLiveSharePageKey,
  } = useLiveShareContext();

  const currentPageKey = useMemo<string | undefined>(() => {
    // TODO: replace hardcoded default page
    return liveShareCurrentPage || localCurrentPageKey || "/App.tsx";
  }, [liveShareCurrentPage, localCurrentPageKey]);

  const onChangeSelectedFile = useCallback(
    (newPageKey: string | undefined) => {
      if (onChangeLiveSharePageKey) {
        onChangeLiveSharePageKey(newPageKey);
      } else {
        setLocalCurrentPageKey(newPageKey);
      }
    },
    [onChangeLiveSharePageKey]
  );

  return {
    currentPageKey,
    onChangeSelectedFile,
  };
}
