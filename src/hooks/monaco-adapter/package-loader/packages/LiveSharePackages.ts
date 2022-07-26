import { ILoadablePackage } from "../MonacoPackageLoader";

export const LiveSharePackages: ILoadablePackage[] = [
  {
    path: "@types/react@^18.0.0/index.d.ts",
    resolvedPath: "@types/react/index.d.ts",
  },
  {
    path: "@types/react@^18.0.0/jsx-dev-runtime.d.ts",
    resolvedPath: "@types/react/jsx-dev-runtime.d.ts",
  },
  {
    path: "@types/react@^18.0.0/jsx-runtime.d.ts",
    resolvedPath: "@types/react/jsx-runtime.d.ts",
  },
  {
    path: "@microsoft/teams-js@2.0.0-experimental.0/dist/MicrosoftTeams.d.ts",
    resolvedPath: "@microsoft/teams-js/index.d.ts",
  },
  {
    path: "@microsoft/live-share@~0.3.1/bin/index.d.ts",
    resolvedPath: "@microsoft/live-share/index.d.ts",
  },
];
