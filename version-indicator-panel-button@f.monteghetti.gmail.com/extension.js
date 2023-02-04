/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */
const ByteArray = imports.byteArray;
const Main = imports.ui.main;
const Config = imports.misc.config;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Lib = Me.imports.modules.lib;
const Ui = Me.imports.modules.ui;

class Extension {
    constructor(uuid) {
        this._uuid = uuid;
        ExtensionUtils.initTranslations(Me.metadata.uuid);
    }

    async enable() {
        this._button = new Ui.Button();
        Main.panel.addToStatusArea(this._uuid, this._button);
            // Linux version
        let ver = null;
        try {
            [ver,] = await Lib.runCommandAsync("uname -r");
            this._button.setText(ver);
            const content = await Lib.loadFileAsync('/proc/cmdline');   
            this._button.addPopupMenuItem("linux "+ver, 
                        ByteArray.toString(content).split('\n')[0]);
        } catch (error) {
            logError(error);
        }
            /* Add PopupMenuItems */ 
            // Nvidia
        try {
            ver = await Lib.loadFileAsync('/proc/driver/nvidia/version');
            ver = ByteArray.toString(ver).split(' ')[8];
            this._button.addPopupMenuItem("nividia "+ ver);
        } catch(e) {
            logError(e);
        }
            // Mesa
        try {
            [ver,] = await Lib.runCommandAsync("pacman -Q mesa");
            this._button.addPopupMenuItem(ver.split('-')[0]);
        } catch (error) {
            logError(error);
        }
            // Glibc
        try {
            [ver,] = await Lib.runCommandAsync("pacman -Q glibc");
            this._button.addPopupMenuItem(ver.split('-')[0]);                
        } catch (error) {
            logError(error);
        }
            // Gnome
        try {
            const [major, minor] = 
                        Config.PACKAGE_VERSION.split('.').map(s => Number(s));
            this._button.addPopupMenuItem("gnome "+major+"."+minor);                
        } catch (error) {
            logError(error);
        }
    }

    disable() {
        this._button.destroy();
        this._button = null;
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}