import * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
import { MutableRefObject, useCallback, useEffect, useRef } from "react";
import { useFluidObjectsContext } from "../../../../../../context-providers";
import { Cursor, ISelection } from "../../../../../../models";
import { getRandomCursorColor } from "./internals";

export const useMonacoPresenceCursors = (
  editor: Monaco.editor.IStandaloneCodeEditor | undefined,
  editorRef: MutableRefObject<Monaco.editor.IStandaloneCodeEditor | undefined>
): {
  onDidInsertText: (
    pos: number,
    characterCount: number,
    pageKey: string
  ) => void;
  onDidRemoveText: (startPos: number, endPos: number, pageKey: string) => void;
} => {
  const { currentPageKey, otherUsers, localUserRef, onChangeCursor } =
    useFluidObjectsContext();
  const startedRef = useRef(false);
  const cursorsRef = useRef<Cursor[]>([]);

  // Callback to refresh tokens. We use editorRef because this callback is
  // used in useMonacoFluidAdapter in JS event
  const onRefreshCursor = useCallback(
    (cursor: Cursor, oldDecorations: string[]) => {
      const model = editorRef.current?.getModel();
      if (!model || !cursor.selection) return;
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
      console.log("refreshing cursor");
      cursor.decorations = editorRef.current!.deltaDecorations(oldDecorations, [
        {
          range,
          options: {
            className: `remote-client-selection ${cursor.color}`,
            isWholeLine: false,
            stickiness:
              Monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
          },
        },
      ]);
    },
    []
  );

  // Callback for when text was inserted to a code file. We pass in editorRef because this callback is
  // used in useMonacoFluidAdapter in JS event
  const onDidInsertText = useCallback(
    (pos: number, characterCount: number, pageKey: string) => {
      cursorsRef.current = cursorsRef.current.map((cursor) => {
        if (cursor.selection) {
          if (cursor.selection.start > pos) {
            // offset the selection range
            cursor.selection = {
              start: cursor.selection.start + characterCount,
              end: cursor.selection.end + characterCount,
            };
            if (cursor.pageKey === pageKey) {
              // Side effect, but efficient...update Monaco editor
              onRefreshCursor(cursor, cursor.decorations);
            }
          }
        }
        return cursor;
      });
    },
    [onRefreshCursor]
  );

  // Callback for when code was removed from the code file. We pass in editorRef because this callback is
  // used in useMonacoFluidAdapter in JS event
  const onDidRemoveText = useCallback(
    (startPos: number, endPos: number, pageKey: string) => {
      cursorsRef.current = cursorsRef.current.map((cursor) => {
        if (cursor.selection) {
          const removedCharacterCount = endPos - startPos;
          if (
            startPos >= cursor.selection.start &&
            startPos <= cursor.selection.end
          ) {
            // we are deleting within the range, adjust new range
            cursor.selection.start =
              startPos > cursor.selection.start
                ? cursor.selection.start
                : startPos;

            cursor.selection.end = Math.max(
              startPos,
              startPos - removedCharacterCount,
              cursor.selection.end - removedCharacterCount
            );
          } else if (cursor.selection.start > endPos) {
            cursor.selection.start =
              cursor.selection.start - removedCharacterCount;
            cursor.selection.end = cursor.selection.end - removedCharacterCount;
          }
          if (cursor.pageKey === pageKey) {
            // Side effect, but efficient...update Monaco editor
            onRefreshCursor(cursor, cursor.decorations);
          }
        }
        return cursor;
      });
    },
    [onRefreshCursor]
  );

  useEffect(() => {
    // Yield so that editor model can reset when currentPageKey changes
    setTimeout(() => {
      if (!editor) return;
      const model = editor.getModel();
      if (!model || !otherUsers) return;
      // For each new/updated cursor, decorate the cursor in the Monaco editor
      const newCursors = otherUsers
        .filter(
          (user) =>
            user.currentPageKey === currentPageKey &&
            !user.isLocal &&
            user.cursor
        )
        .map((user) => Cursor.fromUser(user)!);
      newCursors.forEach((cursor) => {
        const existingCursor = cursorsRef.current.find(
          (checkCursor) => checkCursor.userId === cursor?.userId
        );
        onRefreshCursor(cursor, existingCursor?.decorations ?? []);
      });

      // Clear existing cursors for users who aren't on same page as local user
      const cursorsOnOtherPages = otherUsers
        .filter(
          (user) =>
            user.currentPageKey !== currentPageKey &&
            !user.isLocal &&
            user.cursor
        )
        .map((user) => Cursor.fromUser(user)!);
      cursorsOnOtherPages.forEach((cursor) => {
        const existingCursor = cursorsRef.current.find(
          (checkCursor) => checkCursor.userId === cursor?.userId
        );
        if (existingCursor && existingCursor.decorations.length > 0) {
          cursor.decorations = editor.deltaDecorations(
            existingCursor.decorations,
            []
          );
        }
      });

      cursorsRef.current = [...newCursors, ...cursorsOnOtherPages];
    }, 0);
  }, [editor, otherUsers, currentPageKey, onRefreshCursor]);

  // Listen for cursor position changes and post them
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
        color: localUserRef?.current?.cursor?.color ?? getRandomCursorColor(),
      });
    };
    console.log("useMonacoPresenceCursors: editor.onDidChangeCursorPosition");
    editor!.onDidChangeCursorSelection(handleOnDidChangeCursorPosition);
  }, [editor, onChangeCursor]);

  return {
    onDidInsertText,
    onDidRemoveText,
  };
};
