import * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
import { useEffect, useRef } from "react";
import { Cursor } from "../../../models";
import { useLiveShareContext } from "../../../context-providers";

export const useMonacoPresenceCursors = (
  editor: Monaco.editor.IEditor | undefined
) => {
  const { presence } = useLiveShareContext();
  const startedRef = useRef(false);
  const cursors = useRef<Cursor[]>([]);

  useEffect(() => {
    if (!editor || !presence || !startedRef.current) return;
    const onPresenceChange = () => {
      //
    };
  }, [editor, presence]);
};
