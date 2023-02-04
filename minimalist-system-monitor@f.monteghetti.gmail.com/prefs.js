'use strict';

const { Adw, Gio, Gtk } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();


function init() {
}

function fillPreferencesWindow(window) {
    // Use the same GSettings schema as in `extension.js`
    const settings = ExtensionUtils.getSettings();
    
    // Create a preferences page and group
    const page = new Adw.PreferencesPage();
    const group = new Adw.PreferencesGroup();
    page.add(group);

    // Setting: show-cpu (boolean)
    const row_cpu = new Adw.ActionRow({ title: 'Show CPU usage' });
    group.add(row_cpu);
    const toggle_cpu = new Gtk.Switch({
        active: settings.get_boolean ('show-cpu'),
        valign: Gtk.Align.CENTER,
    });    
    settings.bind(
        'show-cpu',
        toggle_cpu,
        'active',
        Gio.SettingsBindFlags.DEFAULT
    );
    row_cpu.add_suffix(toggle_cpu);
    row_cpu.activatable_widget = toggle_cpu;

    // Setting: show-ram (boolean)
    const row_ram = new Adw.ActionRow({ title: 'Show RAM usage' });
    group.add(row_ram);
    const toggle_mem = new Gtk.Switch({
        active: settings.get_boolean ('show-ram'),
        valign: Gtk.Align.CENTER,
    });
    settings.bind(
        'show-ram',
        toggle_mem,
        'active',
        Gio.SettingsBindFlags.DEFAULT
    );
    row_ram.add_suffix(toggle_mem);
    row_ram.activatable_widget = toggle_mem;

    // Setting: refresh-interval (integer)
    const row_refr = new Adw.ActionRow({ title: 'Refresh interval (s)' });
    group.add(row_refr);
    const refr = new Gtk.SpinButton();
    refr.set_sensitive(true);
    refr.set_range(1, 100);
    refr.set_value(settings.get_int('refresh-interval'));
    refr.set_increments(1, 1);
    settings.bind(
        'refresh-interval',
        refr,
        'value',
        Gio.SettingsBindFlags.DEFAULT
    );
    row_refr.add_suffix(refr);

    // Add page to the window
    window.add(page);
}