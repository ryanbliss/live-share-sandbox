import { FC, useCallback, useEffect, useRef, useState } from 'react'
import { SandpackLayout, SandpackPreview, SandpackProvider, SandpackThemeProvider } from "@codesandbox/sandpack-react"
import { SharedMap } from 'fluid-framework'
import { useCodePages } from '../../hooks/plugins/useCodePages'
import { CodeMirrorRef } from '@codesandbox/sandpack-react/dist/types/components/CodeEditor/CodeMirror'
import SandpackEditor from './sandpack-editor/SandpackEditor'
import { EditorSelection } from '@codemirror/state'


interface ISandpackLiveProps {
    template: "react" | "react-ts";
    codePagesMap: SharedMap | undefined;
}

const SandpackLive: FC<ISandpackLiveProps> = (props) => {
    const { pages, files: codePageFiles, filesRef: codePageFilesRef } = useCodePages(props.codePagesMap);
    const [sandpackFiles, setSandpackFiles] = useState<any>({});
    const codemirrorInstance = useRef<any>();
    const activeFileRef = useRef<string | undefined>();

    const onApplyTemplateChange = useCallback(() => {
        const _files: any = {};
        let valueChanged = false;
        codePageFiles.forEach((value, key) => {
            _files[key] = value;
            if (sandpackFiles[key] !== value) {
                console.log("template changed", key, "current page", activeFileRef.current)
                if (sandpackFiles[key] && key === activeFileRef.current) {
                    // Getting CodeMirror instance
                    const cmInstance = (codemirrorInstance.current as CodeMirrorRef | undefined)?.getCodemirror();
                    if (!cmInstance) {
                        console.log("cmInstance is undefined")
                        return
                    }

                    // Current position
                    const currentPosition = cmInstance.state.selection.ranges[0].to;

                    console.log("cmInstance transaction from 0 to", cmInstance.state.doc.length)
                    // Setting a new position
                    const trans = cmInstance.state.update({
                        selection: EditorSelection.cursor(currentPosition + 1),
                        changes: {
                            from: 0,
                            to: cmInstance.state.doc.length,
                            insert: value,
                        }
                    });

                    cmInstance.update([trans]);
                }
                valueChanged = true;
            }
        })
        if (valueChanged) {
            console.log("setting sandpack files")
            setSandpackFiles(_files);
        }
    }, [codePageFiles, sandpackFiles, activeFileRef, setSandpackFiles])

    useEffect(() => {
        if (codePageFiles.size > 1) {
            onApplyTemplateChange();
        }
    }, [onApplyTemplateChange, codePageFiles]);

    if (codePageFiles.size < 2) {
        return null;
    }

    return (
        <div>
            <SandpackProvider
                // Try out the included templates below!
                template={props.template}
                files={sandpackFiles}
            >
                <SandpackThemeProvider theme={"dark"} style={{ height: "100vh"}}>
                    <SandpackLayout>
                        <SandpackEditor
                            pages={pages}
                            codePageFiles={codePageFiles}
                            codePageFilesRef={codePageFilesRef}
                            activeFileRef={activeFileRef}
                            codemirrorInstance={codemirrorInstance}
                        />
                        <SandpackPreview style={{ height: "100vh"}}/>
                    </SandpackLayout>
                </SandpackThemeProvider>
            </SandpackProvider>
        </div>
    )
}

export default SandpackLive
