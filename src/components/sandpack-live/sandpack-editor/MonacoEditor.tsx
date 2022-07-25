import Editor, { useMonaco } from "@monaco-editor/react";
import * as Monaco from "monaco-editor/esm/vs/editor/editor.api";

import {
  SandpackFile,
  SandpackFiles,
  useActiveCode,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { ICodeFile } from "../../../models/ICodeFile";
import { useLiveShareContext } from "../../../live-share-hooks/useLiveShare";
import { useSandpackMessages } from "../../../sandpack-hooks/useSandpackMessages";
import { MonacoPackageLoader } from "../../../loaders/MonacoPackageLoader";
import { LiveSharePackages } from "../../../constants/LiveSharePackages";

interface IMonacoEditorProps {
  language: "javascript" | "typescript" | "html" | "css";
  theme: "vs-dark" | "light";
  currentPageKey: string | undefined;
  editingEnabled: boolean;
  codeFiles: Map<string, ICodeFile>;
  sandpackFiles: SandpackFiles;
}

interface IKeyValueCodeFile {
  key: string;
  value: ICodeFile;
}
type TKeyValueCodeFile = IKeyValueCodeFile | undefined;

export const MonacoEditor: FC<IMonacoEditorProps> = (props) => {
  const loadedPackagesRef = useRef(false);
  const [editor, setEditor] = useState<
    Monaco.editor.IStandaloneCodeEditor | undefined
  >(undefined);

  const { userDidCreateContainerRef } = useLiveShareContext();
  useSandpackMessages(userDidCreateContainerRef);

  const monaco = useMonaco();

  const currentCodeFile = useMemo<TKeyValueCodeFile>(() => {
    const value: ICodeFile | undefined = props.currentPageKey
      ? props.codeFiles.get(props.currentPageKey!)
      : undefined;
    if (!value) {
      return undefined;
    }
    return {
      key: props.currentPageKey!,
      value,
    };
  }, [props.codeFiles, props.currentPageKey]);

  useEffect(() => {
    if (
      props.currentPageKey &&
      monaco &&
      props.sandpackFiles[props.currentPageKey]
    ) {
      if (!loadedPackagesRef.current) {
        loadedPackagesRef.current = true;
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
          jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
          allowNonTsExtensions: true,
        });
        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: true,
          noSyntaxValidation: true,
          noSuggestionDiagnostics: true,
        });
        MonacoPackageLoader.loadPackages(LiveSharePackages)
          .then((packages) => {
            packages.forEach((loadedPackage) => {
              monaco.languages.typescript.typescriptDefaults.addExtraLib(
                loadedPackage.contents,
                `file:///node_modules/${loadedPackage.name}`
              );
            });
            let model;
            Object.keys(props.sandpackFiles).forEach((key) => {
              const createdModel = monaco.editor.createModel(
                (props.sandpackFiles[key] as SandpackFile).code,
                "typescript",
                monaco.Uri.parse(`file://${key}`)
              );
              if (key === props.currentPageKey) {
                model = createdModel;
              }
            });

            const editor = monaco.editor.create(
              document.getElementById("container")!,
              {
                theme: props.theme,
                automaticLayout: true,
              }
            );
            setEditor(editor);
          })
          .catch((error) => console.error(error));
      } else {
        Object.keys(props.sandpackFiles).forEach((key) => {
          const model = monaco.editor.getModel(
            monaco.Uri.parse(`file://${key}`)
          );
          const codeValue = (props.sandpackFiles[key] as SandpackFile).code;
          if (model !== null) {
            if (model.getValue() !== codeValue) {
              console.log("setting model value");
              model.setValue(codeValue);
            }
          } else {
            monaco.editor.createModel(
              codeValue,
              "typescript",
              monaco.Uri.parse(`file://${key}`)
            );
          }
        });
      }
    }
  }, [monaco, props.currentPageKey, props.sandpackFiles, props.theme]);

  useEffect(() => {
    if (currentCodeFile && editor) {
      const checkUriString = `file://${currentCodeFile.key}`;
      console.log(editor?.getModel()?.uri.toString(), checkUriString);
      if (editor.getModel()?.uri.toString() !== checkUriString) {
        editor.getModel()!.dispose();
        const model = monaco?.editor.getModel(Monaco.Uri.parse(checkUriString));
        if (model) {
          console.log("setting model change listener");
          editor.setModel(model);
          model.onDidChangeContent((event) => {
            console.log("change");
            const stringHelper = currentCodeFile?.value.stringHelper;
            if (
              stringHelper &&
              currentCodeFile?.value.stringHelper.getText() !== model.getValue()
            ) {
              console.log("posting change");
              stringHelper.replaceText(
                model.getValue(),
                0,
                stringHelper.getText().length
              );
            }
          });
        }
      }
    }
  }, [currentCodeFile, editor, monaco]);

  if (!currentCodeFile) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        right: "50%",
        top: 0,
        left: 0,
        bottom: 0,
        height: "100%",
        width: "50%",
      }}
    >
      <div id="container" style={{ width: "100%", height: "100%" }}></div>
      {/* <Editor
        width="100%"
        height="100%"
        language={props.language}
        theme={props.theme}
        key={props.currentPageKey}
        value={currentCodeFile?.value.text}
        beforeMount={(monaco) => {
          monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
            allowNonTsExtensions: true,
          });
          monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: true,
            noSyntaxValidation: true,
            noSuggestionDiagnostics: true,
          });
        }}
        onChange={(value) => {
          console.log("onChange");
          if (
            props.editingEnabled &&
            currentCodeFile &&
            currentCodeFile.value.text !== value
          ) {
            updateCode(value || "");
            // TODO: transform-level operations
            currentCodeFile.value.stringHelper.replaceText(
              value || "",
              0,
              currentCodeFile.value.stringHelper.getText().length
            );
          }
        }}
      /> */}
    </div>
  );
};
