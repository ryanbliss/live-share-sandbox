import { mergeClasses } from "@fluentui/react-components";
import { CSSProperties, FC, ReactNode } from "react";
import { getFlexRowStyles } from "./FlexRow-styles";

interface IFlexRowProps {
  children: ReactNode;
  className?: string;
  expand?: "horizontal" | "vertical" | "fill";
  hAlign?: "start" | "center" | "end";
  vAlign?: "start" | "center" | "end";
  marginSpacer?: "smaller" | "small" | "medium" | "large";
  spaceBetween?: boolean;
  wrap?: boolean;
  style?: CSSProperties;
}

export const FlexRow: FC<IFlexRowProps> = ({
  children,
  className,
  expand,
  hAlign,
  vAlign,
  marginSpacer,
  wrap,
  spaceBetween,
  style,
}) => {
  const flexRowStyles = getFlexRowStyles();
  const mergedClasses = mergeClasses(
    flexRowStyles.root,
    expand === "vertical" ? flexRowStyles.expandVertical : "",
    expand === "horizontal" ? flexRowStyles.expandHorizontal : "",
    expand === "fill" ? flexRowStyles.fill : "",
    hAlign === "center" ? flexRowStyles.hAlignCenter : "",
    hAlign === "end" ? flexRowStyles.hAlignEnd : "",
    hAlign === "start" ? flexRowStyles.hAlignStart : "",
    vAlign === "center" ? flexRowStyles.vAlignCenter : "",
    vAlign === "end" ? flexRowStyles.vAlignEnd : "",
    vAlign === "start" ? flexRowStyles.vAlignStart : "",
    marginSpacer === "smaller" ? flexRowStyles.marginSpacerSmaller : "",
    marginSpacer === "small" ? flexRowStyles.marginSpacerSmall : "",
    marginSpacer === "medium" ? flexRowStyles.marginSpacerMedium : "",
    marginSpacer === "large" ? flexRowStyles.marginSpacerLarge : "",
    spaceBetween ? flexRowStyles.spaceBetween : "",
    wrap ? flexRowStyles.wrap : "",
    className ? className : ""
  );
  return (
    <div className={mergedClasses} style={style}>
      {children}
    </div>
  );
};
