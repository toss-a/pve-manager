Ext.define('PVE.panel.GuestStatusView', {
    extend: 'Proxmox.panel.StatusView',
    alias: 'widget.pveGuestStatusView',
    mixins: ['Proxmox.Mixin.CBind'],

    cbindData: function (initialConfig) {
        var me = this;
        return {
            isQemu: me.pveSelNode.data.type === 'qemu',
            isLxc: me.pveSelNode.data.type === 'lxc',
        };
    },

    controller: {
        xclass: 'Ext.app.ViewController',

        init: function (view) {
            if (view.pveSelNode.data.type !== 'lxc') {
                return;
            }

            const nodename = view.pveSelNode.data.node;
            const vmid = view.pveSelNode.data.vmid;

            Proxmox.Utils.API2Request({
                url: `/api2/extjs/nodes/${nodename}/lxc/${vmid}/config`,
                waitMsgTargetView: view,
                method: 'GET',
                success: ({ result }) => {
                    view.down('#unprivileged').updateValue(
                        Proxmox.Utils.format_boolean(result.data.unprivileged),
                    );
                    view.ostype = Ext.htmlEncode(result.data.ostype);
                },
            });
        },
    },

    layout: {
        type: 'vbox',
        align: 'stretch',
    },

    defaults: {
        xtype: 'pmxInfoWidget',
        padding: '2 25',
    },
    items: [
        {
            xtype: 'box',
            height: 20,
        },
        {
            itemId: 'status',
            title: gettext('Status'),
            iconCls: 'fa fa-info fa-fw',
            printBar: false,
            multiField: true,
            renderer: function (record) {
                var _me = this;
                var text = record.data.status;
                var qmpstatus = record.data.qmpstatus;
                if (qmpstatus && qmpstatus !== record.data.status) {
                    text += ' (' + qmpstatus + ')';
                }
                return text;
            },
        },
        {
            itemId: 'hamanaged',
            iconCls: 'fa fa-heartbeat fa-fw',
            title: gettext('HA State'),
            printBar: false,
            textField: 'ha',
            renderer: PVE.Utils.format_ha,
        },
        {
            itemId: 'node',
            iconCls: 'fa fa-building fa-fw',
            title: gettext('Node'),
            cbind: {
                text: '{pveSelNode.data.node}',
            },
            printBar: false,
        },
        {
            itemId: 'unprivileged',
            iconCls: 'fa fa-lock fa-fw',
            title: gettext('Unprivileged'),
            printBar: false,
            cbind: {
                hidden: '{isQemu}',
            },
        },
        {
            xtype: 'box',
            height: 15,
        },
        {
            itemId: 'cpu',
            iconCls: 'fa fa-fw pmx-itype-icon-processor pmx-icon',
            title: gettext('CPU usage'),
            valueField: 'cpu',
            maxField: 'cpus',
            renderer: Proxmox.Utils.render_cpu_usage,
            // in this specific api call
            // we already have the correct value for the usage
            calculate: Ext.identityFn,
            cbind: {
                hidden: '{isLxc}',
                disabled: '{isLxc}',
            },
        },
        {
            itemId: 'memory',
            iconCls: 'fa fa-fw pmx-itype-icon-memory pmx-icon',
            title: gettext('Memory usage'),
            valueField: 'mem',
            maxField: 'maxmem',
            cbind: {
                hidden: '{isLxc}',
                disabled: '{isLxc}',
            },
        },
        {
            itemId: 'rootfs',
            iconCls: 'fa fa-hdd-o fa-fw',
            title: gettext('Bootdisk size'),
            valueField: 'disk',
            maxField: 'maxdisk',
            printBar: false,
            renderer: function (used, max) {
                var me = this;
                me.setPrintBar(used > 0);
                if (used === 0) {
                    return Proxmox.Utils.render_size(max);
                } else {
                    return Proxmox.Utils.render_size_usage(used, max);
                }
            },
            cbind: {
                hidden: '{isLxc}',
                disabled: '{isLxc}',
            },
        },
        {
            xtype: 'container',
            layout: {
                type: 'vbox',
                align: 'stretch',
            },
            defaults: {
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    align: 'stretch',
                },
                defaults: {
                    xtype: 'pmxInfoWidget',
                    flex: 1,
                    padding: '2 10',
                },
            },
            cbind: {
                hidden: '{isQemu}',
                disabled: '{isQemu}',
            },
            items: [
                {
                    items: [
                        {
                            itemId: 'lxcCpu',
                            iconCls: 'fa fa-fw pmx-itype-icon-processor pmx-icon',
                            title: gettext('CPU usage'),
                            valueField: 'cpu',
                            maxField: 'cpus',
                            renderer: Proxmox.Utils.render_cpu_usage,
                            // in this specific api call
                            // we already have the correct value for the usage
                            calculate: Ext.identityFn,
                        },
                        {
                            itemId: 'lxcMemory',
                            iconCls: 'fa fa-fw pmx-itype-icon-memory pmx-icon',
                            title: gettext('RAM usage'),
                            valueField: 'mem',
                            maxField: 'maxmem',
                        },
                    ],
                },
                {
                    items: [
                        {
                            itemId: 'lxcSwap',
                            iconCls: 'fa fa-refresh fa-fw',
                            title: gettext('SWAP usage'),
                            valueField: 'swap',
                            maxField: 'maxswap',
                        },
                        {
                            itemId: 'lxcRootfs',
                            iconCls: 'fa fa-hdd-o fa-fw',
                            title: gettext('Rootfs size'),
                            valueField: 'disk',
                            maxField: 'maxdisk',
                            printBar: false,
                            renderer: function(used, max) {
                                var me = this;
                                me.setPrintBar(used > 0);
                                if (used === 0) {
                                    return Proxmox.Utils.render_size(max);
                                } else {
                                    return Proxmox.Utils.render_size_usage(used, max);
                                }
                            },
                        },
                    ],
                },
            ],
        },	
        {
            xtype: 'box',
            height: 15,
        },
        {
            itemId: 'agentIPs',
            xtype: 'pveIPView',
            cbind: {
                rstore: '{rstore}',
                pveSelNode: '{pveSelNode}',
                hidden: '{isLxc}',
                disabled: '{isLxc}',
            },
            createUpdateStoreCallback: function(ipview, nodename, vmid) {
                ipview.ipStore = Ext.create('Proxmox.data.UpdateStore', {
                    interval: 10000,
                    storeid: 'pve-qemu-agent-' + vmid,
                    method: 'POST',
                    proxy: {
                        type: 'proxmox',
                        url: '/api2/json/nodes/' + nodename + '/qemu/' + vmid + '/agent/network-get-interfaces',
                    },
                });
                ipview.callParent();

                ipview.mon(ipview.ipStore, 'load', function(_store, records, success) {
                    if (records && records.length) {
                        ipview.nics = records[0].data.result;
                    } else {
                        ipview.nics = undefined;
                    }
                    ipview.updateStatus(!success);
                });
            },
            updateStatusCallback: function(ipview, unsuccessful, defaulttext) {
                var text = defaulttext || gettext('No network information');
                var more = false;
                var ips;
                if (unsuccessful) {
                    text = gettext('Guest Agent not running');
                } else if (ipview.agent && ipview.running) {
                    if (Ext.isArray(ipview.nics) && ipview.nics.length) {
                        more = true;
                        ips = ipview.getDefaultIps(ipview.nics);
                        if (ips.length !== 0) {
                            text = ips.join('<br>');
                        }
                    } else if (ipview.nics && ipview.nics.error) {
                        let msg = gettext('Cannot get info from Guest Agent<br>Error: {0}');
                        text = Ext.String.format(msg, Ext.htmlEncode(ipview.nics.error.desc));
                    }
                } else if (ipview.agent) {
                    text = gettext('Guest Agent not running');
                } else {
                    text = gettext('No Guest Agent configured');
                }

                var ipBox = ipview.down('#ipBox');
                ipBox.update(text);

                var moreBtn = ipview.down('#moreBtn');
                moreBtn.setVisible(more);
            },
            startIPStoreCallback: function(ipview, store) {
                let agentRec = store.getById('agent');
                let state = store.getById('status');
                var errorText;

                ipview.agent = agentRec && agentRec.data.value === 1;
                ipview.running = state && state.data.value === 'running';

                var caps = Ext.state.Manager.get('GuiCap');

                if (!caps.vms['VM.Monitor']) {
                    errorText = gettext("Requires '{0}' Privileges");
                    ipview.updateStatus(false, Ext.String.format(errorText, 'VM.Monitor'));
                    return;
                }

                if (ipview.agent && ipview.running && ipview.ipStore.isStopped) {
                    ipview.ipStore.startUpdate();
                } else if (ipview.ipStore.isStopped) {
                    ipview.updateStatus();
                }
            },
        },
        {
            itemId: 'ctIPS',
            xtype: 'pveIPView',
            cbind: {
                rstore: '{rstore}',
                pveSelNode: '{pveSelNode}',
                hidden: '{!isLxc}',
                disabled: '{!isLxc}',
            },
            createUpdateStoreCallback: function(ipview, nodename, vmid) {
                ipview.ipStore = Ext.create('Proxmox.data.UpdateStore', {
                    interval: 10000,
                    storeid: 'lxc-interfaces-' + vmid,
                    method: 'GET',
                    proxy: {
                        type: 'proxmox',
                        url: '/api2/json/nodes/' + nodename + '/lxc/' + vmid + '/interfaces',
                    },
                });
                ipview.callParent();

                ipview.mon(ipview.ipStore, 'load', function(_store, records, success) {
                    if (records && records.length) {
                        ipview.nics = records.map(r => r.data);
                    } else {
                        ipview.nics = undefined;
                    }
                    ipview.updateStatus(!success);
                });
            },
            updateStatusCallback: function(ipview, _unsuccessful, defaulttext) {
                var text = defaulttext || gettext('No network information');
                var more = false;
                var ips;
                if (Ext.isArray(ipview.nics) && ipview.nics.length) {
                    more = true;
                    ips = ipview.getDefaultIps(ipview.nics);
                    if (ips.length !== 0) {
                        text = ips.join('<br>');
                    }
                }
                var ipBox = ipview.down('#ipBox');
                ipBox.update(text);

                var moreBtn = ipview.down('#moreBtn');
                moreBtn.setVisible(more);
            },
            startIPStoreCallback: function(ipview, store) {
                let state = store.getById('status');
                var errorText;

                ipview.running = state && state.data.value === 'running';

                var caps = Ext.state.Manager.get('GuiCap');

                if (!caps.vms['VM.Audit']) {
                    errorText = gettext("Requires '{0}' Privileges");
                    ipview.updateStatus(false, Ext.String.format(errorText, 'VM.Audit'));
                    return;
                }

                if (ipview.running && ipview.ipStore.isStopped) {
                    ipview.ipStore.startUpdate();
                } else if (ipview.ipStore.isStopped) {
                    ipview.updateStatus();
                }
            },
        },
    ],

    updateTitle: function () {
        var me = this;
        var uptime = me.getRecordValue('uptime');

        var text = '';
        if (Number(uptime) > 0) {
            text =
                ' (' + gettext('Uptime') + ': ' + Proxmox.Utils.format_duration_long(uptime) + ')';
        }

        let title = `<div class="left-aligned">${me.getRecordValue('name') + text}</div>`;

        if (me.pveSelNode.data.type === 'lxc' && me.ostype && me.ostype !== 'unmanaged') {
            // Manual mappings for distros with special casing
            const namemap = {
                archlinux: 'Arch Linux',
                nixos: 'NixOS',
                opensuse: 'openSUSE',
                centos: 'CentOS',
            };

            const distro = namemap[me.ostype] ?? Ext.String.capitalize(me.ostype);
            title += `<div class="right-aligned">
		<i class="fl-${me.ostype} fl-fw"></i>&nbsp;${distro}</div>`;
        }

        me.setTitle(title);
    },
});
