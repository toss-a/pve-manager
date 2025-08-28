Ext.define('PVE.lxc.AutomountInputPanel', {
    extend: 'Proxmox.panel.InputPanel',
    xtype: 'pveLxcAutomountInputPanel',

    mountOptions: ['proc', 'sys', 'cgroup'],

    items: [
        {
            xtype: 'proxmoxKVComboBox',
            name: 'proc',
            fieldLabel: gettext('proc'),
            deleteEmpty: true,
            comboItems: [
                ['None', 'None'],
                ['ro', 'ro'],
                ['mixed', 'mixed'],
                ['rw', 'rw']
            ],
            value: 'None',
        },
        {
            xtype: 'proxmoxKVComboBox',
            name: 'sys',
            fieldLabel: gettext('sys'),
            deleteEmpty: true,
            comboItems: [
                ['None', 'None'],
                ['ro', 'ro'],
                ['mixed', 'mixed'],
                ['rw', 'rw']
            ],
            value: 'None',
        },
        {
            xtype: 'proxmoxKVComboBox',
            name: 'cgroup',
            fieldLabel: gettext('cgroup'),
            deleteEmpty: true,
            comboItems: [
                ['None', 'None'],
                ['ro', 'ro'],
                ['mixed', 'mixed'],
                ['rw', 'rw']
            ],
            value: 'None',
        },
    ],

    onGetValues: function(values) {
        var result = [];

        this.mountOptions.forEach(function(option) {
            if (values[option] && values[option] !== 'None') {
                result.push(option + '=' + values[option]);
            }
            delete values[option]
        });

	if (result.length) {
	    values.automount = result.join(',');
	} else {
	    values.delete = 'automount';
	}

        return values;
    },

    setValues: function(values) {
        var me = this;

        me.mountOptions.forEach(function(option) {
            if (values.automount && values.automount.includes(option + '=')) {
                values[option] = values.automount.split(',').find(function(item) {
                    return item.startsWith(option + '=');
                }).split('=')[1];
            }
        });

        this.callParent([values]);
    },

    initComponent: function() {
        let me = this;
        me.callParent();
    },
});
