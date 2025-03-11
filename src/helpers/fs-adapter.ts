/**
 * Abstract file system interface for cross-platform compatibility.
 * This allows the library to work in both Node.js and browser environments.
 */
import { isBrowser } from "./platform";
export interface FileSystem {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  isDirectory(path: string): Promise<boolean>;
}

/**
 * Node.js implementation of the FileSystem interface.
 * Uses the Node.js fs/promises API.
 */
export class NodeFileSystem implements FileSystem {
  async readFile(path: string): Promise<string> {
    const fs = await import("fs/promises");
    return fs.readFile(path, { encoding: "utf8" });
  }

  async writeFile(path: string, content: string): Promise<void> {
    const fs = await import("fs/promises");
    return fs.writeFile(path, content, { encoding: "utf8" });
  }

  async exists(path: string): Promise<boolean> {
    const fs = await import("fs/promises");
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  async isDirectory(path: string): Promise<boolean> {
    const fs = await import("fs/promises");
    try {
      const stat = await fs.stat(path);
      return stat.isDirectory();
    } catch {
      return false;
    }
  }
}

/**
 * Browser implementation of the FileSystem interface.
 * Uses the Fetch API and File System Access API where available.
 */
export class BrowserFileSystem implements FileSystem {
  async readFile(path: string): Promise<string> {
    // In browser, path would be a URL or File object
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
    }
    return response.text();
  }

  async writeFile(path: string, content: string): Promise<void> {
    // In browser, implement using File System Access API if available,
    // or fall back to download
    if ("showSaveFilePicker" in window) {
      try {
        // @ts-ignore - TypeScript might not know about this API yet
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: path.split("/").pop() || "reqif-file.reqif",
          types: [
            {
              description: "ReqIF Files",
              accept: { "text/xml": [".reqif"] },
            },
          ],
        });
        // @ts-ignore
        const writable = await fileHandle.createWritable();
        // @ts-ignore
        await writable.write(content);
        // @ts-ignore
        await writable.close();
        return;
      } catch (e) {
        // Fall back to download if the user cancels or browser doesn't support
        console.warn(
          "File System Access API failed, falling back to download",
          e,
        );
      }
    }

    // Fall back to download
    const blob = new Blob([content], { type: "text/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = path.split("/").pop() || "reqif-file.reqif";
    a.click();
    URL.revokeObjectURL(url);
  }

  async exists(_path: string): Promise<boolean> {
    // Browser can't reliably check if a file exists without fetching it
    // Return true and let the fetch fail if needed
    return true;
  }

  async isDirectory(_path: string): Promise<boolean> {
    // Browser can't reliably check if a path is a directory
    return false;
  }
}

/**
 * Creates the appropriate FileSystem implementation based on the current environment.
 */
export function createFileSystem(): FileSystem {
  if (isBrowser()) {
    return new BrowserFileSystem();
  }
  return new NodeFileSystem();
}
