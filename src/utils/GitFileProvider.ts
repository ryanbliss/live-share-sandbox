import git from 'isomorphic-git'
import FS from "@isomorphic-git/lightning-fs";
import http from "isomorphic-git/http/web"
import { Buffer } from 'buffer'

export class GitFileProvider {
  fs: FS;
  repositoryUrl: string;
  branch?: string;
  dir: string;

  public static async create(repoUrl: string, branch?: string): Promise<GitFileProvider> {
    const provider = new GitFileProvider(repoUrl, branch);
    return provider.cloneOrUpdateIfNeeded().then(() => provider)
  }

  private constructor(repositoryUrl: string, branch?: string) {
    this.repositoryUrl = repositoryUrl;
    this.dir = repositoryUrl.substring(repositoryUrl.lastIndexOf('/'), repositoryUrl.length);
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

  private async cloneOrUpdateIfNeeded(): Promise<void> {
    return this.fs.promises
      .readdir(this.dir, undefined)
      .then((files: string[]) => {
        if (files.length === 0) {
          return this.clone(this.dir, this.repositoryUrl, this.fs)
        } else {
          // TODO: pull changes
          return Promise.resolve();
        }
      })
  }

  private async clone(dir: string, repositoryUrl: string, fs: FS): Promise<void> {
    // TODO: we need to replace the proxy with privately hosted version, this is a test only version
    return git.clone({ fs, http, dir, ref: this.branch, url: repositoryUrl, corsProxy: 'https://cors.isomorphic-git.org' })
  }
}
