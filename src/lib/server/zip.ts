import yauzl, { Entry } from 'yauzl';
import fs from 'fs';
import path from 'path';

/** Wrapper around `yauzl` to keep the callback hell contained */
export function unzip(zipFile: string, destination: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Yoinked from documentation
    yauzl.open(zipFile, { lazyEntries: true }, (err, zipfile) => {
      if (err) {
        // TypeScript says this is an `Error` :/
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
        reject(err);
      }
      zipfile.readEntry();
      zipfile.on('entry', (entry: Entry) => {
        if (entry.fileName.endsWith('/')) {
          // Directory file names end with '/'.
          // Note that entries for directories themselves are optional.
          // An entry's fileName implicitly requires its parent directories to exist.
          zipfile.readEntry();
        } else {
          // file entry
          const outputFile = path.join(destination, entry.fileName);
          // mkdir -p {outputFile.parent}
          fs.mkdir(path.dirname(outputFile), { recursive: true }, (err) => {
            if (err) {
              reject(err);
            }
            // Make output stream
            // Since the `decodeStrings` option is on-by-default, there is no need to worry about
            // maliciously-crafted `entry.fileName` values trying to escape the destination path
            // (eg `../../escaped`).
            const output = fs.createWriteStream(outputFile)
            // Read file into its output location
            zipfile.openReadStream(entry, (err, readStream) => {
              if (err) {
                // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
                reject(err);
              }
              // No idea why this is giving a warning -- TypeScript says it returns `void`, not `any`
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return
              readStream.on('end', () => zipfile.readEntry());
              readStream.pipe(output);
            });
          });
        }
      });
      // Once the end of the stream is reached, resolve the promise.
      zipfile.on('close', () => {
        resolve();
      });
    });
  });
}
