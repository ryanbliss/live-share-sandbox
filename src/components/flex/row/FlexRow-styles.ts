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
  marginSpacerSmall: {
    "> :not(:last-child)": {
      marginRight: "0.8rem",
    },
  },
  marginSpacerMedium: {
    "> :not(:last-child)": {
      marginRight: "1.6rem",
    },
  },
  marginSpacerLarge: {
    "> :not(:last-child)": {
      marginRight: "2.4rem",
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
