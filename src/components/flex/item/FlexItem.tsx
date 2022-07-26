import { mergeClasses } from "@fluentui/react-components";
import { CSSProperties, FC, ReactNode } from "react";
import { getFlexItemStyles } from "./FlexItem-styles";

interface IFlexItemProps {
  children: ReactNode;
  grow?: boolean;
  noShrink?: boolean;
  style?: CSSProperties;
}

export const FlexItem: FC<IFlexItemProps> = ({
  children,
  grow,
  noShrink,
  style,
}) => {
  const flexItemStyles = getFlexItemStyles();
  const mergedClasses = mergeClasses(
    grow ? flexItemStyles.grow : "",
    noShrink ? flexItemStyles.noShrink : ""
  );

  return (
    <div className={mergedClasses} style={style}>
      {children}
    </div>
  );
};
