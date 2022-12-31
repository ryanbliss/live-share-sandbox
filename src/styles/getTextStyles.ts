/** For Text classes that occur multiple times */

import { makeStyles, shorthands } from "@fluentui/react-components";

export const getTextClampStyles = makeStyles({
  root: {
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 1,
    ...shorthands.overflow("hidden"),
    textOverflow: "ellipsis",
    minWidth: "0rem",
  },
  // Limit to one line of text
  twoLines: {
    WebkitLineClamp: 2,
  },
});
