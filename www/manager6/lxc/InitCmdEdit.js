Ext.define('PVE.lxc.InitCmdEdit', {
    extend: 'Proxmox.window.Edit',
    xtype: 'pveLxcInitCmdEdit',

    subject: gettext('lxc.init.cmd'),
    autoLoad: true,
    width: 600,

    items: [{
	xtype: 'pveLxcInitCmdInputPanel',
    }],
});
