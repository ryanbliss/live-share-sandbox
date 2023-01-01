import { FC, useCallback, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Spinner,
  Text,
} from "@fluentui/react-components";
import { useCodeboxLiveContext } from "../../context-providers";
import {
  FrameworkType,
  IProjectTemplate,
  IRadioItem,
  isLanguageType,
  LanguageType,
} from "../../models";
import { FormRadioGroup, FormTextField } from "../form";
import { FlexColumn } from "../flex";
import { Alert } from "@fluentui/react-components/unstable";
import { isUrlValid } from "../../utils";
import { getFlexColumnStyles } from "../flex/column/FlexColumn-styles";

interface ICreateProjectViaGitDialogProps {}

const LANGUAGE_TYPE_RADIO_ITEMS: IRadioItem[] = [
  {
    value: LanguageType.typescript,
    label: "TypeScript",
  },
  {
    value: LanguageType.javascript,
    label: "JavaScript",
  },
];

const FRAMEWORK_TYPE_RADIO_ITEMS: IRadioItem[] = [
  {
    value: FrameworkType.react,
    label: "React",
  },
  {
    value: FrameworkType.vanilla,
    label: "Vanilla",
  },
  {
    value: FrameworkType.vue,
    label: "Vue",
  },
  {
    value: FrameworkType.svelte,
    label: "Svelte Kit",
  },
  {
    value: FrameworkType.angular,
    label: "Angular",
  },
];

export const CreateProjectViaGitDialog: FC<
  ICreateProjectViaGitDialogProps
> = ({}) => {
  const { createProject } = useCodeboxLiveContext();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();
  const [title, setTitle] = useState<string>("");
  const [gitRemoteUrl, setGitRemoteUrl] = useState<string>("");
  const [branch, setBranch] = useState<string>("");
  const [language, setLanguage] = useState<LanguageType>(
    LanguageType.typescript
  );

  const onCreate = useCallback(async () => {
    const template: IProjectTemplate = {
      language,
      framework: FrameworkType.vanilla,
      title,
      description: "",
      gitRemoteUrl,
      branch: branch ? branch : undefined,
    };
    if (template) {
      setLoading(true);
      try {
        console.log(template);
        await createProject(template);
        setOpen(false);
      } catch (error: any) {
        if (error instanceof Error) {
          setError(error);
        } else {
          setError(
            new Error("An unknown error occurred while creating this template")
          );
        }
      } finally {
        setLoading(false);
      }
    }
  }, [createProject, title, gitRemoteUrl, language, branch]);

  const onChangeLanguage = useCallback((value: string) => {
    if (isLanguageType(value)) {
      setLanguage(value);
    }
  }, []);

  const onChangeTitle = useCallback((value: string) => {
    setTitle(value);
  }, []);
  const onChangeGitRemoteUrl = useCallback((value: string) => {
    setGitRemoteUrl(value);
  }, []);
  const onChangeBranch = useCallback((value: string) => {
    setBranch(value);
  }, []);

  const gitUrlValid = gitRemoteUrl && isUrlValid(gitRemoteUrl);

  const { scroll: scrollStyle } = getFlexColumnStyles();

  return (
    <Dialog
      modalType={loading ? "alert" : "modal"}
      open={open}
      onOpenChange={(event, data) => setOpen(data.open)}
    >
      <DialogTrigger>
        <Button appearance="subtle" size="medium">
          {"Git clone"}
        </Button>
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{"Git clone"}</DialogTitle>
          <DialogContent className={scrollStyle}>
            <FlexColumn marginSpacer="medium">
              <FormTextField
                id="title"
                value={title}
                label="Title"
                required
                placeholder="Enter title text..."
                onChange={onChangeTitle}
              />
              <FormTextField
                id="git-url"
                value={gitRemoteUrl}
                label="Git remote URL"
                required
                placeholder="Enter git remote URL..."
                onChange={onChangeGitRemoteUrl}
              />
              <FormTextField
                id="branch"
                value={branch}
                label="Default branch"
                placeholder="Enter default branch..."
                onChange={onChangeBranch}
              />
              <FormRadioGroup
                id={"language"}
                title={"Language"}
                required
                disabled={loading}
                selectedValue={language}
                radioItems={LANGUAGE_TYPE_RADIO_ITEMS}
                onChange={onChangeLanguage}
              />
              {loading && (
                <FlexColumn
                  vAlign="center"
                  hAlign="center"
                  marginSpacer="small"
                  style={{ minHeight: "5.4rem" }}
                >
                  <Text>{"Creating project..."}</Text>
                  <Spinner />
                </FlexColumn>
              )}
              {error && (
                <Alert intent="error" action="Retry" onClick={onCreate}>
                  {error.message}
                </Alert>
              )}
            </FlexColumn>
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary" disabled={loading}>
                {"Cancel"}
              </Button>
            </DialogTrigger>
            <Button
              appearance="primary"
              disabled={!language || !title || !gitUrlValid || loading}
              onClick={onCreate}
            >
              {"Create"}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
