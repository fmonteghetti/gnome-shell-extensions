'use strict';

const { GObject, St, Clutter} = imports.gi;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const ExtensionUtils = imports.misc.extensionUtils;

/**
 * Button with PopupMenu opening the extension preferences page.
 */
var Button = GObject.registerClass({GTypeName: 'MSMPanelButton'},
    class Button extends PanelMenu.Button {
        _init(text) {
            super._init(0.0, _('Button'));
            this._label = new St.Label({ text: text,
                y_expand: true,
                y_align: Clutter.ActorAlign.CENTER });
            this.add_child(this._label);

            const settingMenuItem = new PopupMenu.PopupMenuItem(_('Settings'));
            settingMenuItem.connect('activate', () => {
                if (ExtensionUtils.openPrefs) {
                    ExtensionUtils.openPrefs();
                }
            });
            this.menu.addMenuItem(settingMenuItem);
        }
    
        setText(text) {
            return this._label.set_text(text);
        }
    });
    