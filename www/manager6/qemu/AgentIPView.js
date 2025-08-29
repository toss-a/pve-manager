Ext.define('PVE.window.IPInfo', {
    extend: 'Ext.window.Window',
    width: 600,
    title: gettext('Network Information'),
    height: 300,
    layout: {
        type: 'fit',
    },
    modal: true,
    items: [
        {
            xtype: 'grid',
            store: {},
            emptyText: gettext('No network information'),
            viewConfig: {
                enableTextSelection: true,
            },
            columns: [
                {
                    dataIndex: 'name',
                    text: gettext('Name'),
                    renderer: Ext.htmlEncode,
                    flex: 3,
                },
                {
                    dataIndex: 'hardware-address',
                    text: gettext('MAC address'),
                    renderer: Ext.htmlEncode,
                    width: 140,
                },
                {
                    dataIndex: 'ip-addresses',
                    text: gettext('IP address'),
                    align: 'right',
                    flex: 4,
                    renderer: function (val) {
                        if (!Ext.isArray(val)) {
                            return '';
                        }
                        var ips = [];
                        val.forEach(function (ip) {
                            var addr = ip['ip-address'];
                            var pref = ip.prefix;
                            if (addr && pref) {
                                ips.push(Ext.htmlEncode(addr + '/' + pref));
                            }
                        });
                        return ips.join('<br>');
                    },
                },
            ],
        },
    ],
});

Ext.define('PVE.IPView', {
    extend: 'Ext.container.Container',
    xtype: 'pveIPView',

    layout: {
        type: 'hbox',
        align: 'top',
    },

    nics: [],
    startIPStoreCallback: undefined,
    updateStatusCallback: undefined,
    createUpdateStoreCallback: undefined,

    items: [
        {
            xtype: 'box',
            html: '<i class="fa fa-exchange"></i> IPs',
        },
        {
            xtype: 'container',
            flex: 1,
            layout: {
                type: 'vbox',
                align: 'right',
                pack: 'end',
            },
            items: [
                {
                    xtype: 'label',
                    flex: 1,
                    itemId: 'ipBox',
                    style: {
                        'text-align': 'right',
                    },
                },
                {
                    xtype: 'button',
                    itemId: 'moreBtn',
                    hidden: true,
                    ui: 'default-toolbar',
                    handler: function (btn) {
                        let view = this.up('pveIPView');

                        var win = Ext.create('PVE.window.IPInfo');
                        win.down('grid').getStore().setData(view.nics);
                        win.show();
                    },
                    text: gettext('More'),
                },
            ],
        },
    ],

    getDefaultIps: function (nics) {
        var _me = this;
        var ips = [];
        nics.forEach(function (nic) {
            if (
                nic['hardware-address'] &&
                nic['hardware-address'] !== '00:00:00:00:00:00' &&
                nic['hardware-address'] !== '0:0:0:0:0:0'
            ) {
                let nic_ips = nic['ip-addresses'] || [];
                nic_ips.forEach(function (ip) {
                    var p = ip['ip-address'];
                    // show 2 ips at maximum
                    if (ips.length < 2) {
                        ips.push(Ext.htmlEncode(p));
                    }
                });
            }
        });

        return ips;
    },

    startIPStore: function (store, records, success) {
        var me = this;
        me.startIPStoreCallback(me, store);
    },

    updateStatus: function (unsuccessful, defaulttext) {
        var me = this;
        me.updateStatusCallback(me, unsuccessful, defaulttext);
    },

    initComponent: function () {
        var me = this;

        if (!me.rstore) {
            throw 'rstore not given';
        }

        if (!me.pveSelNode) {
            throw 'pveSelNode not given';
        }

        var nodename = me.pveSelNode.data.node;
        var vmid = me.pveSelNode.data.vmid;

        me.createUpdateStoreCallback(me, nodename, vmid);

        me.on('destroy', me.ipStore.stopUpdate, me.ipStore);

        // if we already have info about the vm, use it immediately
        if (me.rstore.getCount()) {
            me.startIPStore(me.rstore, me.rstore.getData(), false);
        }

        // check if the guest agent is there on every statusstore load
        me.mon(me.rstore, 'load', me.startIPStore, me);
    },
});
