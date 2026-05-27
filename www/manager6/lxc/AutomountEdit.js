Ext.define('PVE.lxc.AutomountEdit', {
    extend: 'Proxmox.window.Edit',
    xtype: 'pveLxcAutomountEdit',

    subject: gettext('lxc.mount.auto'),
    autoLoad: true,
    width: 350,

    items: [{
	xtype: 'pveLxcAutomountInputPanel',
    }],
});
