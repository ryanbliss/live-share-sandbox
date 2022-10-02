import axios from "axios";

export interface ILoadedPackageContents {
  name: string;
  contents: string | null;
}
export interface ILoadablePackage {
  path: string;
  resolvedPath: string;
}
export class MonacoPackageLoader {
  private static packages = new Map<string, string>();

  public static async loadPackages(
    loadablePackages: ILoadablePackage[]
  ): Promise<ILoadedPackageContents[]> {
    return new Promise(async (resolve, reject) => {
      const loadedPackages: ILoadedPackageContents[] = [];
      loadablePackages.forEach((loadablePackage) => {
        const checkPackageContents = MonacoPackageLoader.packages.get(
          loadablePackage.resolvedPath
        );
        if (checkPackageContents) {
          loadedPackages.push({
            name: loadablePackage.resolvedPath,
            contents: checkPackageContents,
          });
          if (loadedPackages.length === loadablePackages.length) {
            resolve(loadedPackages);
          }
        } else {
          MonacoPackageLoader.loadPackage(loadablePackage)
            .then((loadedPackage) => {
              loadedPackages.push(loadedPackage);
              MonacoPackageLoader.packages.set(
                loadedPackage.name,
                loadedPackage.contents!
              );
              if (loadedPackages.length === loadablePackages.length) {
                resolve(loadedPackages);
              }
            })
            .catch((error: Error) => {
              console.error(error);
              loadedPackages.push({
                name: loadablePackage.resolvedPath,
                contents: null,
              });
              if (loadedPackages.length === loadablePackages.length) {
                resolve(loadedPackages);
              }
            });
        }
      });
    });
  }

  private static async loadPackage(
    loadablePackage: ILoadablePackage
  ): Promise<ILoadedPackageContents> {
    const response = await axios.get(
      `https://unpkg.com/${loadablePackage.path}`
    );
    const packageContents = response.data as string;
    return {
      name: loadablePackage.resolvedPath,
      contents: packageContents,
    };
  }
}
