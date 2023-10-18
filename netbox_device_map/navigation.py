from extras.plugins import PluginMenuItem, PluginMenu


menu = PluginMenu(
    label='Map',
    icon_class='mdi mdi-earth',
    groups=(
        ('MAP',
            (
                PluginMenuItem(link='plugins:netbox_device_map:map', link_text='Device map', permissions=["dcim.view_site", "dcim.view_device"]),
            ),
        ),
    ),
)
