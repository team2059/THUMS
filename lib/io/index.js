/**
 * Helper functions for working with files.
 * @module: lib/io
 */

var fs = require('fs'),
    path = require('path');

/**
 * Convert all paths to be relative to the main directory.
 * @param {string} file_name
 * @returns {string}
 */
function createPath(file_name) {
    'use strict';
    return path.resolve(__dirname, '..', '..', file_name);
}

/**
 * Check if a directory exists.
 *    If it does not, create that directory.
 * @param {string} path
 * @returns {Promise}
 */
function ensureExists(path) {
    'use strict';
    return new Promise(
        (resolve) => {
            fs.exists(path, (exists) => {
                if (exists) {
                    resolve();
                } else {
                    fs.mkdir(path, 511); // Create the directory.
                    resolve();
                }
            });
        });
}

/**
 * Read a directory and return an array of every file in that directory.
 * @param {string} directory_name
 * @returns {Promise}
 */
function readDirectory(directory_name) {
    'use strict';
    return new Promise(
        function (resolve, reject) {
            fs.readdir(createPath(directory_name), (err, files) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(files);
                }
            });
        });
}

/**
 * Copy a file from one directory to another.
 * @param {string} file_directory - The source directory.
 * @param {string} file_name - The file being copied.
 * @param {string} destination_name - The destination directory.
 * @returns {Promise}
 */
function copyFile(file_directory, file_name, destination_name) {
    'use strict';
    let file = path.join(createPath(file_directory), file_name),
        destination = path.join(createPath(destination_name), file_name);
    return new Promise(
        (resolve, reject) => {
            try {
                ensureExists(createPath(destination_name))
                    .then(() => {
                        fs.createReadStream(file)
                            .pipe(fs.createWriteStream(destination));
                        resolve(destination);
                    });
            } catch (e) {
                reject(e);
            }
        }
    );
}

/**
 * Copy all files in a directory and place them in another.
 * @param {string} file_directory - The source directory.
 * @param {string} destination - The destination directory.
 * @returns {Promise}
 */
function copyDirectory(file_directory, destination) {
    'use strict';
    return new Promise(
        (resolve, reject) => {
            readDirectory(file_directory).then((files) => {
                return files.map((i) => {
                    return copyFile(file_directory, i, destination);
                });
            }).then(resolve)
            .catch((e) => {
                reject(e);
            });
        });
}

/**
 * Read the contents of a file.
 * @param {string} file_name
 * @returns {Promise}
 */
function readFile(file_name) {
    'use strict';
    return new Promise(
        function (resolve, reject) {
            fs.readFile(createPath(file_name), function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        }
    );
}

/**
 * Write a string to a new file.
 * @param {string} file_name
 * @param {string} input
 * @returns {Promise}
 */
function writeFile(file_name, input) {
    'use strict';
    return new Promise(
        function (resolve, reject) {
            fs.writeFile(createPath(file_name), input, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        }
    );
}

/**
 * Read a file and return its contents a JSON object.
 * @param {string} file_name
 * @returns {Promise}
 */
function readFileAsJson(file_name) {
    'use strict';
    let file_path = createPath(file_name);
    return new Promise(
        (resolve, reject) => {
            return readFile(file_path).then(JSON.parse)
                .then((json_data) => {
                    resolve(json_data);
                }).catch(SyntaxError, () => {
                    reject('Invalid JSON file');
                }).catch(() => {
                    reject('Unable to read');
                });
        });
}

module.exports = {
    createPath: createPath,
    readDirectory: readDirectory,
    copyDirectory: copyDirectory,
    copyFile: copyFile,
    readFile: readFile,
    readFileAsJson: readFileAsJson,
    writeFile: writeFile
};
