import git from "isomorphic-git";
import FS from "@isomorphic-git/lightning-fs";
import http from "isomorphic-git/http/web";
import { Buffer } from "buffer";

/* Example usage
  GitFileProvider
    .create('containerId' ,'https://github.com/ryanbliss/live-share-sandbox', 'main')
    .then((fileProvider) => {
      fileProvider
        .getFileText('README.md')
        .then((text) => console.log(text))
        .catch((err: any) => console.error(err));

      fileProvider
        .getDir()
        .then((text) => console.log(text))
        .catch((err: any) => console.error(err));

      fileProvider
        .getDir("src/components")
        .then((text) => console.log(text))
        .catch((err: any) => console.error(err));
    })
*/

export interface IFileInfo extends FS.Stats {
  path: string;
  name: string;
}

export interface IFile extends IFileInfo {
  content: string;
}

const IGNORE_LIST = [
  "package-lock.json",
  ".git",
  ".vscode",
  "README.md",
  ".gitignore",
  "LICENSE",
];

export class GitFileProvider {
  repositoryUrl: string;
  branch?: string;
  private fs: FS;
  private dir: string;

  // TODO: we need to replace the proxy with privately hosted version, this is a test only version
  private proxy: string = "https://cors.isomorphic-git.org";

  public static async create(
    containerId: string,
    repositoryUrl: string,
    branch?: string
  ): Promise<GitFileProvider> {
    const provider = new GitFileProvider(containerId, repositoryUrl, branch);
    return provider.clone().then(() => provider);
  }

  private constructor(
    containerId: string,
    repositoryUrl: string,
    branch?: string
  ) {
    (globalThis as any)["Buffer"] = Buffer;
    this.repositoryUrl = repositoryUrl;
    const repositoryName = repositoryUrl.substring(
      repositoryUrl.lastIndexOf("/"),
      repositoryUrl.length
    );
    this.dir = `${repositoryName}-${containerId}`;
    this.branch = branch;
    this.fs = new FS(this.dir);
  }

  public async getAllFiles(): Promise<IFile[]> {
    return this.getFilesInternal();
  }

  private async getFilesInternal(path: string = "."): Promise<IFile[]> {
    const fileInfos = await this.getDir(path);
    const files: IFile[] = [];
    for (let i = 0; i < fileInfos.length; i++) {
      const file = fileInfos[i];
      if (!IGNORE_LIST.includes(file.name)) {
        if (file.type === "dir") {
          const dirFiles = await this.getFilesInternal(file.path);
          files.push(...dirFiles);
        } else if (file.type === "file") {
          const fileText = await this.getFileText(file.path);
          files.push({
            ...file,
            content: fileText,
          });
        }
      }
    }
    return files;
  }

  public async getFileText(path: string): Promise<string> {
    return this.fs.promises
      .readFile(`${this.dir}/${path}`, undefined)
      .then((data: Uint8Array | string) => {
        if (typeof data === "string") {
          return data;
        } else {
          return Buffer.from(data).toString("utf8");
        }
      });
  }

  public async getDir(path: string = "."): Promise<IFileInfo[]> {
    const filePaths = await this.getDirInternal(path);
    const files: IFileInfo[] = [];
    for (let i = 0; i < filePaths.length; i++) {
      const filePath = filePaths[i];
      const stats: FS.Stats = await this.fs.promises.stat(
        `${this.dir}/${path}/${filePath}`
      );
      files.push({
        ...stats,
        path: `${path}/${filePath}`,
        name: filePath,
      });
    }
    return files;
  }

  private async getDirInternal(path: string = "."): Promise<string[]> {
    return this.fs.promises.readdir(`${this.dir}/${path}`);
  }

  private clone(): Promise<void> {
    return this.cloneInternal(this.dir, this.repositoryUrl, this.fs);
  }

  private cloneInternal(
    dir: string,
    repositoryUrl: string,
    fs: FS
  ): Promise<void> {
    return git.clone({
      fs,
      http,
      dir,
      ref: this.branch,
      url: repositoryUrl,
      corsProxy: this.proxy,
    });
  }

  // private async cloneOrUpdateIfNeeded(): Promise<void> {
  //   return this.fs.promises
  //     .readdir(this.dir, undefined)
  //     .then(async (files: string[]) => {
  //       if (files.length === 0) {
  //         return this.clone(this.dir, this.repositoryUrl, this.fs)
  //       } else {
  //         return this.checkoutLatest(this.dir, this.repositoryUrl, this.fs, this.branch)
  //       }
  //     })
  // }

  // private async checkoutLatest(dir: string, repositoryUrl: string, fs: FS, branch: string): Promise<void> {
  //   // TODO: if cannot pull with fast-forward, then delete branch and checkout from origin again
  //   await git.fetch({ fs, http, dir, ref: branch, url: repositoryUrl, corsProxy: this.proxy })
  //   await git.pull({ fs, http, dir, ref: branch, url: repositoryUrl, fastForwardOnly: true, corsProxy: this.proxy })
  //   await git.checkout({ fs, dir, ref: branch })
  // }
}
