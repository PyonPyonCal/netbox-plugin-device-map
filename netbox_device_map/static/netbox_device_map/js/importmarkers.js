function importGeoMarkers(kmlFile) {
  const geoFile = toGeoJSON.kml(new DomParser().parseFromString(kmlFile, 'application/xml')); //convert kml file to geoJson with togeojson
  const marker_imported_layer = new L.markerClusterGroup({ disableClusteringAtZoom: 18 });
  marker_imported_layer.id = "importedLayer";
  const cable_layer = new L.layerGroup();
  cable_layer.id = "cableLayer";
    try {
      for(let i=0; i<geoFile["features"].length; i++){
        let name = geoFile["features"][i]["properties"]["name"];
        if(geoFile["features"][i]["geometry"]["type"] == "Point"){
          var IUrl = '/static/netbox_device_map/js/icons/cube-outline.svg';
          if(/^\d+.*$/.test(name)){
            iUrl = '/static/netbox_device_map/js/icons/camera-iris.svg';
          }
          var icon = L.icon{
            iconUrl: iUrl,
            iconSize: [38,95],
            iconAnchor: [20,48],
            popupAnchor: [-3,-76],
            shadowUrl: '/static/netbox_device_map/js/icons/circleBg.png',
            shadowSize: [38,38],
            shadowAnchor: [20,20],
          });
          let markerOpts = {
            "title": name,
            "clickable": true,
            "icon": icon,
          }
          let markerObj = L.marker([geoFile["features"][i]["geometry"]["coordinates"][1], geoFile["features"][i]["geometry"]["coordinates"][0]],markerOpts);
          const popupContent = '<h6>' + name;
          markerObj.bindPopup(popupContent).openPopup();
          marker_imported_layer.addLayer(markerObj);
        } else {
          const lineCoords = [];
          for(let j=0; j<geoFile["features"][i]["geometry"]["coordinates"].length; j++){
            let coords = [geoFile["features"][i]["geometry"]["coordinates"][j][1], geoFile["features"][i]["geometry"]["coordinates"][j][0]];
            lineCoords.push(coords);
          }
          let colour = 'black';
          let dash = '0,0';
          if(name == "MM"){
            colour = 'orange';
          }else if(name == "PSM" || name == "SM"){
            colour = 'yellow';
          }else if(/^.*coax.*$/.test(name)){
            colour = 'white';
          }else if(/^.*\-.*$/.test(name)){
            colour = 'aqua';
            dash = '10,10'
          }else{
            colour = 'blue';
          }
          let linePoly = L.polyline(lineCoords, {color: colour, dashArray: dash}).bindPopup(name);
          cable_layer.addLayer(linePoly);
        }
      } catch(error) { console.error(error) }
  layerControl.addBaseLayer(marker_imported_layer, "Imported");
  layerControl.addOverlay(cable_layer, "Cables");
}
