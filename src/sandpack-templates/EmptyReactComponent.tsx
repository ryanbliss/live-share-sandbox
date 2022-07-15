export const buildEmptyReactComponent = (componentName: string) => {
  return `
export default function ${componentName}() {
  return (
    <>
    </>
  )
}
`;
};
