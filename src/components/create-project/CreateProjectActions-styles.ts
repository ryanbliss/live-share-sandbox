import { makeStyles } from "@fluentui/react-components";

export const getCreateProjectFullButtonsStyles = makeStyles({
  root: {
    "@media only screen and (max-width: 680px)": {
      display: "none",
    },
  },
});

export const getCreateProjectMenuStyles = makeStyles({
  root: {
    "@media only screen and (min-width: 681px)": {
      display: "none",
    },
  },
});
