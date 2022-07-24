import Editor, { useMonaco } from "@monaco-editor/react";
import { useActiveCode, useSandpack } from "@codesandbox/sandpack-react";
import { FC, useEffect, useMemo, useState } from "react";
import { ICodeFile } from "../../../models/ICodeFile";
import { useLiveShareContext } from "../../../live-share-hooks/useLiveShare";
import { useSandpackMessages } from "../../../sandpack-hooks/useSandpackMessages";
import { MonacoPackageLoader } from "../../../loaders/MonacoPackageLoader";

interface IMonacoEditorProps {
  language: "javascript" | "typescript" | "html" | "css";
  theme: "vs-dark" | "light";
  currentPageKey: string | undefined;
  editingEnabled: boolean;
  codeFiles: Map<string, ICodeFile>;
}

interface IKeyValueCodeFile {
  key: string;
  value: ICodeFile;
}
type TKeyValueCodeFile = IKeyValueCodeFile | undefined;

export const MonacoEditor: FC<IMonacoEditorProps> = (props) => {
  const [loadedPackages, setLoadedPackages] = useState(false);
  const { sandpack } = useSandpack();
  const { updateCode } = useActiveCode();

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

  // useEffect(() => {
  //   if (props.currentPageKey && monaco && loadedPackages) {
  //     if (monaco && currentCodeFile) {
  //       monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
  //         jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
  //         allowNonTsExtensions: true,
  //       });
  //       monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
  //         noSemanticValidation: true,
  //         noSyntaxValidation: true,
  //         noSuggestionDiagnostics: true,
  //       });

  //       MonacoPackageLoader.loadPackages([
  //         {
  //           path: "@types/react@^18.0.0/index.d.ts",
  //           resolvedPath: "@types/react/index.d.ts",
  //         },
  //         {
  //           path: "@types/react@^18.0.0/jsx-dev-runtime.d.ts",
  //           resolvedPath: "@types/react/jsx-dev-runtime.d.ts",
  //         },
  //         {
  //           path: "@types/react@^18.0.0/jsx-runtime.d.ts",
  //           resolvedPath: "@types/react/jsx-runtime.d.ts",
  //         },
  //         {
  //           path: "@microsoft/teams-js@2.0.0-experimental.0/dist/MicrosoftTeams.d.ts",
  //           resolvedPath: "@microsoft/teams-js/index.d.ts",
  //         },
  //         {
  //           path: "@microsoft/live-share@~0.3.1/bin/index.d.ts",
  //           resolvedPath: "@microsoft/live-share/index.d.ts",
  //         },
  //       ])
  //         .then((packages) => {
  //           packages.forEach((loadedPackage) => {
  //             monaco.languages.typescript.typescriptDefaults.addExtraLib(
  //               loadedPackage.contents,
  //               `file:///node_modules/${loadedPackage.name}`
  //             );
  //           });
  //           const model = monaco.editor.createModel(
  //             currentCodeFile.value.text,
  //             "typescript",
  //             monaco.Uri.parse(`file://${currentCodeFile.key}`)
  //           );

  //           monaco.editor.create(document.getElementById("container")!, {
  //             model,
  //           });
  //         })
  //         .catch((error) => console.error(error));
  //     }
  //   }
  // }, [monaco, currentCodeFile, loadedPackages, setLoadedPackages]);

  useEffect(() => {
    console.log(sandpack.files);
  }, [sandpack]);

  if (!currentCodeFile) {
    return null;
  }

  return (
    <div
      id="container"
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
      <Editor
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
      />
    </div>
  );
};
