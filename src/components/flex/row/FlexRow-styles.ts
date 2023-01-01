import { makeStyles } from "@fluentui/react-components";

export const getFlexRowStyles = makeStyles({
  root: {
    display: "flex",
    height: "auto",
    /** Fix for flex containers:
     * minHeight/Width ensures padding is respected when
     * computing height wrt child components */
    minHeight: 0,
    minWidth: 0,
  },
  expandVertical: {
    height: "100%",
  },
  expandHorizontal: {
    width: "100%",
  },
  fill: {
    width: "100%",
    height: "100%",
  },
  marginSpacerSmaller: {
    "> :not(:last-child)": {
      marginRight: "2px",
    },
  },
  marginSpacerSmall: {
    "> :not(:last-child)": {
      marginRight: "8px",
    },
  },
  marginSpacerMedium: {
    "> :not(:last-child)": {
      marginRight: "16px",
    },
  },
  marginSpacerLarge: {
    "> :not(:last-child)": {
      marginRight: "24px",
    },
  },
  spaceBetween: {
    justifyContent: "space-between",
  },
  hAlignStart: {
    justifyContent: "start",
  },
  hAlignCenter: {
    justifyContent: "center",
  },
  hAlignEnd: {
    justifyContent: "end",
  },
  vAlignStart: {
    alignItems: "start",
  },
  vAlignCenter: {
    alignItems: "center",
  },
  vAlignEnd: {
    alignItems: "end",
  },
  wrap: {
    flexWrap: "wrap",
  },
});
