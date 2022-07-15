import { mergeClasses } from "@fluentui/react-components";
import { CSSProperties, FC, ReactNode } from "react";
import { getFlexRowStyles } from "./FlexStyles";

interface IFlexRowProps {
  children: ReactNode;
  fill?: boolean;
  hAlign?: "start" | "center" | "end";
  vAlign?: "start" | "center" | "end";
  marginSpacer?: "small" | "medium" | "large";
  spaceBetween?: boolean;
  wrap?: boolean;
  style?: CSSProperties;
}

export const FlexRow: FC<IFlexRowProps> = ({
  children,
  fill,
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
    fill ? flexRowStyles.fill : "",
    hAlign === "center" ? flexRowStyles.hAlignCenter : "",
    hAlign === "end" ? flexRowStyles.hAlignEnd : "",
    hAlign === "start" ? flexRowStyles.hAlignStart : "",
    vAlign === "center" ? flexRowStyles.vAlignCenter : "",
    vAlign === "end" ? flexRowStyles.vAlignEnd : "",
    vAlign === "start" ? flexRowStyles.vAlignStart : "",
    marginSpacer === "small" ? flexRowStyles.marginSpacerSmall : "",
    marginSpacer === "medium" ? flexRowStyles.marginSpacerMedium : "",
    marginSpacer === "large" ? flexRowStyles.marginSpacerLarge : "",
    spaceBetween ? flexRowStyles.spaceBetween : "",
    wrap ? flexRowStyles.wrap : ""
  );
  return (
    <div className={mergedClasses} style={style}>
      {children}
    </div>
  );
};
