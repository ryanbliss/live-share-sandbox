import * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
import { useEffect, useRef } from "react";
import { useFluidObjectsContext } from "../../../context-providers";
import { Cursor, ISelection } from "../../../models";

export const useMonacoPresenceCursors = (
  editor: Monaco.editor.IStandaloneCodeEditor | undefined
) => {
  const { users, currentPageKey, onChangeCursor } = useFluidObjectsContext();
  const startedRef = useRef(false);
  const cursorsRef = useRef<Cursor[]>([]);

  useEffect(() => {
    if (!editor) return;
    const model = editor.getModel();
    if (!model) return;

    const newCursors = users
      .filter(
        (user) =>
          user.currentPageKey === currentPageKey && !user.isLocal && user.cursor
      )
      .map((user) => Cursor.fromUser(user)!);

    newCursors.forEach((cursor) => {
      console.log(
        "useMonacoPresenceCursors: updating remote cursors for pos",
        cursor.selection
      );
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

      const existingCursor = cursorsRef.current.find(
        (checkCursor) => checkCursor.userId === cursor?.userId
      );
      cursor.decorations = editor.deltaDecorations(
        existingCursor?.decorations ?? [],
        [
          {
            range,
            options: {
              className: `remote-client-selection`,
              isWholeLine: false,
              stickiness:
                Monaco.editor.TrackedRangeStickiness
                  .NeverGrowsWhenTypingAtEdges,
            },
          },
        ]
      );
    });
    cursorsRef.current = newCursors;
  }, [editor, users, currentPageKey]);

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
      let firstPosition: Monaco.Position = ev.selection.getSelectionStart();
      let lastPosition: Monaco.Position = ev.selection.getEndPosition();
      // if (ev.secondaryPositions.length > 0) {
      //   firstPosition = ev.position.isBefore(ev.secondaryPositions[0])
      //     ? ev.position
      //     : ev.secondaryPositions[0];
      //   lastPosition = ev.secondaryPositions[ev.secondaryPositions.length - 1];
      // } else {
      //   firstPosition = ev.position;
      //   lastPosition = ev.position;
      // }

      const cursorSelection: ISelection = {
        start: model!.getOffsetAt(firstPosition),
        end: model!.getOffsetAt(lastPosition),
      };
      console.log("useMonacoPresenceCursors: changing cursor for local user");
      onChangeCursor({
        selection: cursorSelection,
        color: "red",
      });
    };
    console.log("useMonacoPresenceCursors: onDidChangeCursorPosition");
    editor!.onDidChangeCursorSelection(handleOnDidChangeCursorPosition);
  }, [editor, onChangeCursor]);
};
