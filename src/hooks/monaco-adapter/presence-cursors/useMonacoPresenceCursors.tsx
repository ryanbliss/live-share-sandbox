import * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
import { useEffect, useRef } from "react";
import { useFluidObjectsContext } from "../../../context-providers";
import { Cursor, ISelection } from "../../../models";
import { getRandomCursorColor } from "../../../utils";

export const useMonacoPresenceCursors = (
  editor: Monaco.editor.IStandaloneCodeEditor | undefined
) => {
  const { users, localUserRef, currentPageKey, onChangeCursor } =
    useFluidObjectsContext();
  const startedRef = useRef(false);
  const cursorsRef = useRef<Cursor[]>([]);

  useEffect(() => {
    // Yield so that editor model can reset when currentPageKey changes
    setTimeout(() => {
      if (!editor) return;
      const model = editor.getModel();
      if (!model) return;
      // For each new/updated cursor, decorate the cursor in the Monaco editor
      const newCursors = users
        .filter(
          (user) =>
            user.currentPageKey === currentPageKey &&
            !user.isLocal &&
            user.cursor
        )
        .map((user) => Cursor.fromUser(user)!);
      newCursors.forEach((cursor) => {
        let decorations: Monaco.editor.IModelDeltaDecoration[] = [];
        if (cursor.selection) {
          let start = model.getPositionAt(cursor.selection.start);
          let end = model.getPositionAt(cursor.selection.end);

          /** Selection is inverted */
          if (start > end) {
            [start, end] = [end, start];
          }
          const range = new Monaco.Range(
            start.lineNumber,
            start.column,
            end.lineNumber,
            end.column
          );

          decorations = [
            {
              range,
              options: {
                className: `remote-client-selection ${cursor.color}`,
                isWholeLine: false,
                stickiness:
                  Monaco.editor.TrackedRangeStickiness
                    .NeverGrowsWhenTypingAtEdges,
              },
            },
          ];
        }
        const existingCursor = cursorsRef.current.find(
          (checkCursor) => checkCursor.userId === cursor?.userId
        );
        cursor.decorations = editor.deltaDecorations(
          existingCursor?.decorations ?? [],
          decorations
        );
      });

      // Clear existing cursors for users who aren't on same page as local user
      const cursorsOnOtherPages = users
        .filter(
          (user) =>
            user.currentPageKey !== currentPageKey &&
            !user.isLocal &&
            user.cursor
        )
        .map((user) => Cursor.fromUser(user)!);
      cursorsOnOtherPages.forEach((cursor) => {
        console.log("cursor on another page");
        const existingCursor = cursorsRef.current.find(
          (checkCursor) => checkCursor.userId === cursor?.userId
        );
        if (existingCursor && existingCursor.decorations.length > 0) {
          console.log("deleting");
          cursor.decorations = editor.deltaDecorations(
            existingCursor.decorations,
            []
          );
        }
      });

      cursorsRef.current = [...newCursors, ...cursorsOnOtherPages];
    }, 0);
  }, [editor, users, currentPageKey]);

  // Listen for
  useEffect(() => {
    if (startedRef.current || !editor) return;
    startedRef.current = true;
    const handleOnDidChangeCursorPosition = (
      ev: Monaco.editor.ICursorSelectionChangedEvent
    ) => {
      if (ev.reason === Monaco.editor.CursorChangeReason.RecoverFromMarkers) {
        return;
      }
      const model = editor!.getModel();
      const firstPosition = ev.selection.getStartPosition();
      const lastPosition = ev.selection.getEndPosition();

      const cursorSelection: ISelection = {
        start: model!.getOffsetAt(firstPosition),
        end: model!.getOffsetAt(lastPosition),
      };
      onChangeCursor({
        selection: cursorSelection,
        color: localUserRef.current?.cursor?.color ?? getRandomCursorColor(),
      });
    };
    console.log("useMonacoPresenceCursors: onDidChangeCursorPosition");
    editor!.onDidChangeCursorSelection(handleOnDidChangeCursorPosition);
  }, [editor, onChangeCursor]);
};
