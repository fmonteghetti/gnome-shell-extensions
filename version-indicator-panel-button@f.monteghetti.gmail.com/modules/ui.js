'use strict';

const {GObject, St, Clutter} = imports.gi;

const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

// Button to be added to the gnome-shell top bar
var Button = GObject.registerClass({GTypeName: 'VIPBPanelButton'},
    class Button extends PanelMenu.Button {
        _init() {
            super._init(0.0, _('Button'));
                /* Main label */
            this._label = new St.Label({ text: "N/A",
                y_expand: true,
                y_align: Clutter.ActorAlign.CENTER });
            this.add_child(this._label);
        }
    
        setText(text) {
            return this._label.set_text(text);
        }
    
        // name: string or null
        addPopupMenuItem(name,click_string=null) {
            if(name) {
                let v = new PopupMenu.PopupMenuItem(_(name));
                if (click_string) {
                    v.connect('activate', () => {
                        // Copy click_string to clipboard when clicked
                    St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD,click_string);
                });                
                }   
                this.menu.addMenuItem(v);    
            }
        }
    });
