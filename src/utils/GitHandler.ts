import git from 'isomorphic-git'
import FS from "@isomorphic-git/lightning-fs";
import http from "isomorphic-git/http/web"
import { Buffer } from 'buffer'

interface FileProvider {
  getFileText(path: string): Promise<string>
}

export class GitHandler implements FileProvider {
  fs: FS;
  repositoryUrl: string;
  dir: string;

  constructor(repositoryUrl: string) {
    this.repositoryUrl = repositoryUrl;
    this.dir = repositoryUrl.substring(repositoryUrl.lastIndexOf('/'), repositoryUrl.length);
    this.fs = new FS(this.dir);
  }

  public async getFileText(path: string): Promise<string> {
    return this
      .cloneOrUpdateIfNeeded()
      .then(() => this.readFile(path))
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

  private async readFile(path: string): Promise<string> {
    return this.fs.promises
      .readFile(`${this.dir}/${path}`, undefined).then((data: Uint8Array | string) => {
        if (typeof data === 'string') {
          return data;
        } else {
          return Buffer.from(data).toString("utf8");
        }
      })
  }


  private async clone(dir: string, repositoryUrl: string, fs: FS): Promise<void> {
    return git.clone({ fs, http, dir, url: repositoryUrl, corsProxy: 'https://cors.isomorphic-git.org' })
  }
}