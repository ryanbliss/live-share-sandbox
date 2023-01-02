export const buildEmptyTSReactComponent = (componentName: string) => {
  return `import { FC } from "react";

interface IComponentProps {
  // Enter your types here
}

const ${componentName}: FC<IComponentProps> = (props) => {
  return (
    <>
    </>
  );
}

export default ${componentName};`;
};

export const buildEmptyJSReactComponent = (componentName: string) => {
  return `const ${componentName} = (props) => {
  return (
    <>
    </>
  );
}
${componentName}.displayName = ${componentName};

export default ${componentName};`;
};
