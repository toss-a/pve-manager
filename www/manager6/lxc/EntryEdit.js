Ext.define('PVE.lxc.EntryEdit', {
    extend: 'Proxmox.window.Edit',

    vmconfig: undefined,

    isAdd: true,
    width: 450,

    initComponent: function() {
	let me = this;

	me.isCreate = !me.confid;

	let ipanel = Ext.create('PVE.lxc.EntryInputPanel', {
	    confid: me.confid,
	    isCreate: me.isCreate,
	    pveSelNode: me.pveSelNode,
	});

	let subject;
	if (me.isCreate) {
	    subject = gettext('Entry');
	} else {
	    subject = gettext('Entry') + ' (' + me.confid + ')';
	}

	Ext.apply(me, {
	    subject: subject,
	    items: [ipanel],
	});

	me.callParent();

	me.load({
	    success: function(response, options) {
		ipanel.setVMConfig(response.result.data);
		if (me.isCreate) {
		    return;
		}

		let data = PVE.Parser.parsePropertyString(response.result.data[me.confid], 'path');

		let values = {
		    path1: data.path1,
		    path2: data.path2,
		    create: data.create,
		};

		ipanel.setValues(values);
	    },
	});
    },
});
