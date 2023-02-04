'use strict';

const {GLib, Gio} = imports.gi;
const ByteArray = imports.byteArray;

/**
 * runCommandAsync:
 * @param {String} command - shell command to execute
 * @returns {Promise<String[]>} - stdout and stderr
 *
 * Convenience function to run shell command asynchronously. From
 * GJS asynchronous programming guide.
 */
function runCommandAsync(command) {
    const proc = Gio.Subprocess.new(command.split(" "),
            Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE);
    return new Promise((resolve, reject) => {
        proc.communicate_utf8_async(null, null, (proc, result) => {
            try {
                const [, stdout,stderr] = proc.communicate_utf8_finish(result);
                // If the task succeeds, we can return the result with resolve()
                // Remove trayling newline
                resolve([stdout.replace(/\n$/, ''),stderr.replace(/\n$/, '')]);
            } catch (e) {
                // If an error occurred, we can report it using reject()
                reject(e);
            }
        });
    });
}

/**
 * loadFileAsync:
 * @param {String} filename - name of file to read
 * @returns {Promise<GLib.ByteArray>} - file contents
 *
 * Convenience function to read file asynchronously. From GJS asynchronous
 * programming guide.
 */
 function loadFileAsync(filename) {
    const file = Gio.File.new_for_path(filename);
    return new Promise((resolve, reject) => {
        file.load_contents_async(null, (file, result) => {
            try {
                let [,content] = file.load_contents_finish(result);
                resolve(content);
            } catch (e) {
                reject(e);
            }
        });
    });
}