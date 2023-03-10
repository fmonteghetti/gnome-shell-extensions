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

const {GObject, GLib} = imports.gi;
const Main = imports.ui.main;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Lib = Me.imports.modules.lib;
const Ui = Me.imports.modules.ui;

class Extension {
    constructor(uuid) {
        this._uuid = uuid;
        ExtensionUtils.initTranslations(Me.metadata.uuid);
    }

    enable() {
            // attributes
        this._CPUUsage = new Lib.CPUUsage();
        this._button = new Ui.Button("N/A");
        this._settings = ExtensionUtils.getSettings();
        this._RAMfmt = "GiB"; // 'GiB' or 'percent' TODO: set as setting
            // display button
        Main.panel.addToStatusArea(this._uuid, this._button);
            // update button
        this._update_button_text();
            // setup periodic button update
        this._timer = this._create_timer();
            // setup callback for settings change
        this._setup_settings_callback();
    }

    disable() {
        if (this._button) {
            this._button.destroy();
            this._button = null;
        }
        this._delete_timer(this._timer);
    }

    /**
     * _create_timer:
     * @returns {int} ID of the event source.
     * 
     * Sets a timer to update button at regular interval.
     */
    _create_timer() {
        const timer = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT_IDLE,
                                    this._settings.get_int('refresh-interval'),
                                    this._update_button_text.bind(this));
        return timer;
    }

    /**
     * _delete_timer:
     * @param {int} ID of the event source.
     * 
     * Delete timer.
     */
    _delete_timer(timer) {
        if (timer) {
            GLib.source_remove(timer);
            timer = null;
        }
    }

    /**
     * _update_button_text:
     * @param {int}
     * 
     * Update text button with new stats.
     */
    async _update_button_text() {
        const displayText = await Lib.getDisplayText(
                                        this._settings.get_boolean('show-cpu'),
                                        this._settings.get_boolean('show-ram'),
                                        this._RAMfmt,
                                        this._CPUUsage);
        this._button.setText(displayText);
        return GLib.SOURCE_CONTINUE;
    }
    
    /**
     * _setup_settings_callback:
     * 
     * Setup callback functions when settings are changed.
     */
    _setup_settings_callback() {
        this._settings.connect('changed::show-cpu', 
                                this._callback_showCPU.bind(this));
        this._settings.connect('changed::show-ram', 
                                this._callback_showRAM.bind(this));
        this._settings.connect('changed::refresh-interval', 
                                this._callback_refreshInterval.bind(this));
    }

    /**
     * _callback_showCPU:
     * 
     * Callback function for change in 'show-cpu'.
     */
    _callback_showCPU() {
        log("Setting show-cpu updated.");
        this._update_button_text();
    }

    /**
     * _callback_showRAM:
     * 
     * Callback function for change in 'show-ram'.
     */
    _callback_showRAM() {
        log("Setting show-ram updated.");
        this._update_button_text();
    }

    /**
     * _callback_refreshInterval:
     * 
     * Callback function for change in 'refresh-interval'.
     */
    _callback_refreshInterval() {
        log("Setting refresh-interval updated.");
        // re-create timeout with new refresh-interval value
        this._delete_timer(this._timer);
        this._timer = this._create_timer();
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}