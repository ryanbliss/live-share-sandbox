# Live Share Sandbox

This project uses [Microsoft Live Share](https://www.github.com/microsoft/live-share-sdk) to enable a collaborative code sandbox in Teams.

## Local testing

To test the project locally, first install the npm packages and then start the app.

### npm

```bash
npm install
npm run start
```

### yarn

```bash
yarn install
yarn start
```

## Test in Teams

Compress the inner contents of the [teams-app-package](teams-app-package) folder into a .zip file and upload as a custom app to Teams.

_Note:_ Do not compress the teams-app-package folder itself.

## Credit

- [Sandpack](https://github.com/codesandbox/sandpack) is used for real-time app bundling and hot-reloading.
- [Monaco editor](https://github.com/microsoft/monaco-editor) is used as the code text editor.
- [Microsoft Live Share](https://www.github.com/microsoft/live-share-sdk) for synchronization in Teams.
- [Fluid Framework](https://github.com/microsoft/fluidframework) for powering Live Share and Monaco sample inspiration.
- [Fluent UI](https://github.com/microsoft/fluentui) for a solid React component library.

## License

Licensed under the [MIT](LICENSE) License, except for dependencies which have various licenses.
