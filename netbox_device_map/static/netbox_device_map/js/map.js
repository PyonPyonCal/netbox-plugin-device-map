let default_marker_icon = {
  iconSize: [22, 33],
  shadowEnable: true,
  shadowOpacity: 0.25,
  shadowAngle: 27,
  shadowLength: 0.64,
  shadowBlur: 1.5
}
let marker_icon_configs = {
  'access-switch': Object.assign({color: "#2da652"}, default_marker_icon),
  'core-switch': Object.assign({color: "#d30b0b"}, default_marker_icon),
  'distribution-switch': Object.assign({color: "#277fca"}, default_marker_icon),
  olt: Object.assign({color: "#c5ba26"}, default_marker_icon),
  router: Object.assign({color: "#26A69A"}, default_marker_icon),
  wifi: Object.assign({color: "#8111ea"}, default_marker_icon)
}

const map_data = JSON.parse(document.getElementById('map-data').textContent)

var esriSat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y]/{x}',{
  maxZoom:20,
  attribution: 'Esri',
});

var mapTile = L.tileLayer(map_data.tiles.url_template, { maxZoom: 20, MaxNativeZoom: 18 });

var baseMap = {
  "Satellite": esriSat,
};

let geomap = L.map(map_data.map_id,
  {
    crs: L.CRS[map_data.crs],
    layers: [mapTile],
    fullscreenControl: true,
    fullscreenControlOptions: {position: 'topright'},
    minZoom: 11;
  }
)

var layerControl = L.control.layers(baseMap).addTo(geomap);
geomap.eachLayer(function(layer){ layerControl.addBaseLayer(layer, "Base") });

geomap.attributionControl.setPrefix(`<a href="https://leafletjs.com" title="A JavaScript library for interactive maps">Leaflet</a>`)
geomap.attributionControl.addAttribution(map_data.attribution)

let sidebar = L.control.sidebar('map-sidebar', {
  closeButton: true,
  position: 'left'
})
geomap.addControl(sidebar);

let bounds = new L.LatLngBounds()

// Preparing to place markers with the same coordinates in clusters
let markers = {}
map_data.markers.forEach(function(entry) {
  let key = entry.position.toString()
  if (key in markers) {
    markers[key].push(entry)
  } else {
    markers[key] = [entry]
  }
})

const marker_parent_layer = L.markerClusterGroup({ maxClusterRadius: 100, animateAddingMarkers: true }); // create cluster layer

for (let key in markers) {
  for (let marker_data of markers[key]) {
    let iconOptions = {}
    if (marker_data.icon && marker_data.icon in marker_icon_configs) {
      iconOptions = marker_icon_configs[marker_data.icon]
    } else {
      iconOptions = default_marker_icon
    }
    let markerObj = L.marker(marker_data.position, {icon: L.divIcon.svgIcon(iconOptions), device: marker_data.device})
      .bindTooltip(`${marker_data.device.name}<br><span class="text-muted">${marker_data.device.role}</span>`)
    markerObj.on('click', function (event) {
      let device = event.target.options.device
      if (sidebar.isVisible() && (sidebar.displayed_device === device.id)) {
        sidebar.displayed_device = undefined
        sidebar.hide()
      } else {
        sidebar.displayed_device = device.id
        document.querySelector('.sidebar-device-name').innerHTML = `<a href="${device.url}" target="_blank">${device.name}</a>`
        document.querySelector('.sidebar-device-role').innerHTML = device.role
        document.querySelector('.sidebar-device-ip').innerHTML = device.ip
        sidebar.show()
        fetch(`connected-cpe/${device.id}?vlan=${map_data.vlan}`)
          .then(response => response.json()).then(
          function (response) {
            if (response.status === true) {
              document.querySelector('.sidebar-device-type').innerHTML = response.device_type
              let cpe_list = document.querySelector('.sidebar-cpe-list')
              cpe_list.innerHTML = ""
              if (response.cpe_devices?.length) {
                cpe_list.innerHTML = `<div class="mb-2">Connected CPEs in the selected VLAN:</div>`
                let ul = document.createElement('ul')
                ul.setAttribute('class', 'mb-0')
                cpe_list.appendChild(ul)
                for (let cpe_device of response.cpe_devices) {
                  let li = document.createElement('li');
                  li.innerHTML = `<a href="${cpe_device.url}" target="_blank">${cpe_device.name}</a>
                                    <span class="separator">·</span>
                                    <span class="text-muted">${cpe_device.comments}</span>`
                  ul.appendChild(li)
                }
              } else {
                cpe_list.innerHTML = "<i>There are no connected CPEs in the selected VLAN</i>"
              }
            }
          }
        )
      }
    })
    bounds.extend(marker_data.position)
    marker_parent_layer.addLayer(markerObj)
  }
}

var layerControl.addOverlay(marker_parent_layer, "Netbox");

const normalLineStyle = {weight: 3, color: '#3388ff'}
const boldLineStyle ={weight: 5, color:'#0c10ff'};

for (let connection of map_data.connections) {
  let line = L.polyline(connection, normalLineStyle).addTo(geomap)
  line.on('mouseover', function () {this.setStyle(boldLineStyle); this.bringToFront()})
  line.on('mouseout', function () {this.setStyle(normalLineStyle)})
}

if (bounds.isValid()) {
  geomap.fitBounds(bounds)
} else {
  geomap.fitWorld()
}
