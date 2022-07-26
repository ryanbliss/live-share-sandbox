import { mergeClasses } from "@fluentui/react-components";
import { CSSProperties, FC, ReactNode } from "react";
import { getFlexColumnStyles } from "./FlexColumn-styles";

interface IFlexColumnProps {
  children: ReactNode;
  expand?: "horizontal" | "vertical" | "fill";
  hAlign?: "start" | "center" | "end";
  vAlign?: "start" | "center" | "end";
  marginSpacer?: "small" | "medium" | "large";
  scroll?: boolean;
  spaceBetween?: boolean;
  style?: CSSProperties;
}

export const FlexColumn: FC<IFlexColumnProps> = ({
  children,
  expand,
  hAlign,
  vAlign,
  marginSpacer,
  scroll,
  spaceBetween,
  style,
}) => {
  const flexColumnStyles = getFlexColumnStyles();
  const mergedClasses = mergeClasses(
    flexColumnStyles.root,
    expand === "vertical" ? flexColumnStyles.expandVertical : "",
    expand === "horizontal" ? flexColumnStyles.expandHorizontal : "",
    expand === "fill" ? flexColumnStyles.fill : "",
    hAlign === "center" ? flexColumnStyles.hAlignCenter : "",
    hAlign === "end" ? flexColumnStyles.hAlignEnd : "",
    hAlign === "start" ? flexColumnStyles.hAlignStart : "",
    vAlign === "center" ? flexColumnStyles.vAlignCenter : "",
    vAlign === "end" ? flexColumnStyles.vAlignEnd : "",
    vAlign === "start" ? flexColumnStyles.vAlignStart : "",
    marginSpacer === "small" ? flexColumnStyles.marginSpacerSmall : "",
    marginSpacer === "medium" ? flexColumnStyles.marginSpacerMedium : "",
    marginSpacer === "large" ? flexColumnStyles.marginSpacerLarge : "",
    scroll ? flexColumnStyles.scroll : "",
    spaceBetween ? flexColumnStyles.spaceBetween : ""
  );

  return (
    <div className={mergedClasses} style={style}>
      {children}
    </div>
  );
};
