Ext.define('PVE.lxc.EntryInputPanel', {
    extend: 'Proxmox.panel.InputPanel',
    mixins: ['Proxmox.Mixin.CBind'],

    autoComplete: false,

    controller: {
	xclass: 'Ext.app.ViewController',
    },

    setVMConfig: function(vmconfig) {
	let me = this;
	me.vmconfig = vmconfig;

	if (me.isCreate) {
	    PVE.Utils.forEachLxcEntry((i, name) => {
		if (!Ext.isDefined(vmconfig[name])) {
		    me.confid = name;
		    me.down('field[name=entryid]').setValue(i);
		    return false;
		}
		return undefined;
	    });
	}
    },

    onGetValues: function(values) {
	let me = this;
	let confid = me.isCreate ? "entry" + values.entryid : me.confid;
	delete values.entryid;
	let val = PVE.Parser.printPropertyString(values, 'path');
	let ret = {};
	ret[confid] = val;
	return ret;
    },

    items: [
	{
	    xtype: 'proxmoxintegerfield',
	    name: 'entryid',
	    minValue: 0,
	    maxValue: 6,
	    hidden: true,
	    allowBlank: false,
	    disabled: true,
	    cbind: {
		disabled: '{!isCreate}',
	    },
	},
	{
	    xtype: 'textfield',
	    name: 'path1',
	    fieldLabel: gettext('Source Path'),
	    labelWidth: 120,
	    editable: true,
	    allowBlank: false,
	    emptyText: '/dev/xyz',
	    validator: function(v) {
		if (!v.startsWith('/dev/')) {
		    return gettext("Path must start with /dev/");
		}
		if (!/^\/dev\/[\w/-]+$/.test(v)) {
		    return gettext("Invalid path format");
		}
		return true;
	    },
	},
	{
	    xtype: 'textfield',
	    name: 'path2',
	    fieldLabel: gettext('Target Path'),
	    labelWidth: 120,
	    editable: true,
	    allowBlank: false,
	    emptyText: '/dev/xyz',
	    validator: function(v) {
		if (!v.startsWith('/dev/')) {
		    return gettext("Path must start with /dev/");
		}
		if (!/^\/dev\/[\w/-]+$/.test(v)) {
		    return gettext("Invalid path format");
		}
		return true;
	    },
	},
	{
	    xtype: 'combo',
	    name: 'create',
	    fieldLabel: gettext('Create Type'),
	    labelWidth: 120,
	    editable: false,
	    allowBlank: false,
	    store: ['file', 'dir'],
	    value: 'file',
	    triggerAction: 'all',
	    emptyText: gettext('Select create type'),
	},
    ],
});
