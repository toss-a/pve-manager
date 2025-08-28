Ext.define('PVE.lxc.InitCmdInputPanel', {
    extend: 'Proxmox.panel.InputPanel',
    xtype: 'pveLxcInitCmdInputPanel',

    items: [
        {
            fieldLabel: gettext('lxc.init.cmd'),
            xtype: 'textfield',
            name: 'initcmd',
            allowBlank: true,
            width: 500,
        },
    ],

    onGetValues: function(values) {
        if (!values.initcmd || values.initcmd.trim() === '') {
	    values.delete = 'initcmd';
	    delete values.initcmd;
        }

	return values;
    },

    setValues: function(values) {
        this.callParent([values]);
    },

    initComponent: function() {
        let me = this;
        me.callParent();
    },
});
