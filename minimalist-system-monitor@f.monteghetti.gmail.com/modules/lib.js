'use strict';

const Gio = imports.gi.Gio;
const ByteArray = imports.byteArray;

/**
 * formatAsPercent:
 * @param {float} val - value in [0,1]
 * @returns {string} -  value as "XX%"
 *
 * Format usage value as a string.
 */
function formatAsPercent(val) {
    return (
        Math.round(val * 100)
            .toString()
            .padStart(2,'0') + "%"
    );
}

/**
 * formatAsGiB:
 * @param {float} val - value in GiB
 * @returns {string} -  value as "XX.XG"
 *
 * Format memory size as a string.
 */
 function formatAsGiB(val) {
    val = Math.round(val * 10) / 10;
    return val.toFixed(1).toString() + "G";
}

/**
 * load_contents_async_promise:
 * @param {Gio.File} file - file to read
 * @returns {Promise}
 *
 * Convenience function to read file asynchronously. From GJS asynchronous
 * programming guide.
 */
function load_contents_async_promise(file) {
    return new Promise((resolve, reject) => {
        file.load_contents_async(null, (file, result) => {
            try {
                const [,contents] = file.load_contents_finish(result);
                resolve(contents);
            } catch (e) {
                reject(e);
            }
        });
    });
}

/**
 * getCurrentMemoryUsage:
 * @returns {array[float]} [used RAM in GiB, used RAM/total RAM]
 *
 * Return memory usage obtained from /proc/meminfo.
 * Adapted from ssm-gnome@lgiki.net
 */
async function getCurrentMemoryUsage() {
    let currentMemoryUsage = 0;
    let memTotal = -1;
    let memAvailable = -1;
    let memUsed = -1;

    try {
        const inputFile = Gio.File.new_for_path('/proc/meminfo');
        const content = await load_contents_async_promise(inputFile);
        const contentStr = ByteArray.toString(content);
        const contentLines = contentStr.split('\n');

        for (let i = 0; i < contentLines.length; i++) {
            const fields = contentLines[i].trim().split(/\W+/);

            if (fields.length < 2) {
                break;
            }

            const itemName = fields[0];
            const itemValue = Number.parseInt(fields[1]);

            if (itemName == 'MemTotal') {
                memTotal = itemValue;
            }

            if (itemName == 'MemAvailable') {
                memAvailable = itemValue;
            }

            if (memTotal !== -1 && memAvailable !== -1) {
                break;
            }
        }

        if (memTotal !== -1 && memAvailable !== -1) {
            memUsed = memTotal - memAvailable;
            currentMemoryUsage = memUsed / memTotal;
        }
    } catch (e) {
        logError(e);
    }
        // Convert from KiB (2^10) to GiB (2^30)
    return [memUsed*(2**(10-30)), currentMemoryUsage];
};


/**
 * getDisplayText:
 * @param {bool} showCPU - whether to display cpu usage
 * @param {bool} showRAM - whether to display ram usage
 * @param {string} RAMfmt - ram usage display format ('GiB' or 'percent')
 * @param {CPUUsage} CPUUsage - CPU usage value in [0,1]
 * @returns {string} - text for display
 *
 * Return string ready for display.
 */
async function getDisplayText(showCPU,showRAM,RAMfmt,CPUUsage) {
    let displayText = ""
        // CPU usage
    if (showCPU) {
        displayText += "C "+formatAsPercent(await CPUUsage.getCurrentCPUUsage());
    }
        // Separator
    if (showCPU && showRAM) {
        displayText += " | "
    }
        // RAM usage
    if (showRAM) {
        let table = await getCurrentMemoryUsage();
        if (RAMfmt == "percent") {
            displayText += "M "+formatAsPercent(table[1]);
        } else if (RAMfmt == "GiB") {
            displayText += "M "+formatAsGiB(table[0]);
        }
    }
    return displayText;
}


/**
 * Compute and store CPU usage.
 */
var CPUUsage = class {
    constructor() {
        // CPU usage values in [0,1]
      this._lastCPUUsed = 0;
      this._lastCPUTotal = 0;
      this.currentCPUUsage = 0;
    }
    
    /**
     * computeCurrentCPUUsage:
     * @returns {float} - usage value in [0,1]
     *
     * Return cpu usage obtained from /proc/stat.
     * Source: ssm-gnome@lgiki.net
     */
    async _computeCurrentCPUUsage(){
        this.currentCPUUsage = 0;
        try {
            const inputFile = Gio.File.new_for_path('/proc/stat');
            const content = await load_contents_async_promise(inputFile);
            const contentStr = ByteArray.toString(content);
            const contentLines = contentStr.split('\n');
    
            let currentCPUUsed = 0;
            let currentCPUTotal = 0;
    
            for (let i = 0; i < contentLines.length; i++) {
                const fields = contentLines[i].trim().split(/\W+/);
    
                if (fields.length < 2) {
                    continue;
                }
    
                const itemName = fields[0];
                if (itemName == 'cpu' && fields.length >= 5) {
                    const user = Number.parseInt(fields[1]);
                    const system = Number.parseInt(fields[3]);
                    const idle = Number.parseInt(fields[4]);
                    currentCPUUsed = user + system;
                    currentCPUTotal = user + system + idle;
                    break;
                }
            }
    
            this.currentCPUUsage = (currentCPUUsed - this._lastCPUUsed) /
                                   (currentCPUTotal - this._lastCPUTotal);
            this._lastCPUTotal = currentCPUTotal;
            this._lastCPUUsed = currentCPUUsed;
        } catch (e) {
            logError(e);
        }
    }

    /**
     * getCurrentCPUUsage:
     * @returns {float} - usage value in [0,1]
     *
     * Return cpu usage.
     */
    async getCurrentCPUUsage() {
        await this._computeCurrentCPUUsage();
        return this.currentCPUUsage;
    }
}