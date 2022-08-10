import git from 'isomorphic-git'
import FS from "@isomorphic-git/lightning-fs";
import http from "isomorphic-git/http/web"
import { Buffer } from 'buffer'

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

export class GitFileProvider {
  repositoryUrl: string;
  branch?: string;
  private fs: FS;
  private dir: string;
  
  // TODO: we need to replace the proxy with privately hosted version, this is a test only version
  private proxy: string = 'https://cors.isomorphic-git.org'

  public static async create(containerId: string, repositoryUrl: string, branch?: string): Promise<GitFileProvider> {
    const provider = new GitFileProvider(containerId, repositoryUrl, branch);
    return provider.clone().then(() => provider)
  }

  private constructor(containerId: string, repositoryUrl: string, branch?: string) {
    (globalThis as any)["Buffer"] = Buffer
    this.repositoryUrl = repositoryUrl;
    const repositoryName = repositoryUrl.substring(repositoryUrl.lastIndexOf('/'), repositoryUrl.length);
    this.dir = `${repositoryName}-${containerId}`
    this.branch = branch;
    this.fs = new FS(this.dir);
  }

  public async getDir(path: string = "."): Promise<string[]> {
    return this.fs.promises.readdir(`${this.dir}/${path}`);
  }

  public async getFileText(path: string): Promise<string> {
    return this.fs.promises
      .readFile(`${this.dir}/${path}`, undefined)
      .then((data: Uint8Array | string) => {
        if (typeof data === 'string') {
          return data;
        } else {
          return Buffer.from(data).toString("utf8");
        }
      })
  }

  private clone(): Promise<void> {
    return this.cloneInternal(this.dir, this.repositoryUrl, this.fs)
  }

  private cloneInternal(dir: string, repositoryUrl: string, fs: FS): Promise<void> {
    return git.clone({ fs, http, dir, ref: this.branch, url: repositoryUrl, corsProxy: this.proxy })
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
