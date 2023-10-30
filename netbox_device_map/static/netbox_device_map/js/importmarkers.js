function importGeoMarkers(kmlFile) {
  const geoFile = toGeoJSON.kml(new DomParser().parseFromString(kmlFile, 'application/xml')); //convert kml file to geoJson with togeojson
  const marker_imported_layer = new L.markerClusterGroup({ disableClusteringAtZoom: 18 });
  marker_imported_layer.id = "importedLayer";
  const cable_layer = new L.layerGroup();
  cable_layer.id = "cableLayer";
    try {
      for(let i=0; i<geoFile["features"].length; i++){
        if(geoFile["features"][i]["geometry"]["type"] == "Point"){
          let markerOpts = {
            "title": geoFile["features"][i]["properties"]["name"],
            "clickable": true,
            "icon": L.divIcon.svgIcon(default_marker_icon),
          }
          let markerObj = L.marker([geoFile["features"][i]["geometry"]["coordinates"][1], geoFile["features"][i]["geometry"]["coordinates"][0]],markerOpts);
          const popupContent = '<h2>' + geoFile["features"][i]["properties"]["name"]).openPopup();
          marker_imported_layer.addLayer(markerObj);
        } else {
          const lineCoords = [];
          for(let j=0; j<geoFile["features"][i]["geometry"]["coordinates"].length; j++){
            let coords = [geoFile["features"][i]["geometry"]["coordinates"][j][1], geoFile["features"][i]["geometry"]["coordinates"][j]];
            lineCoords .push(coords);
          }
          let linePoly = L.polyline(lineCoords, {color: 'black'});
          cable_layer.addLayer(linePoly);
        }
  layerControl.addBaseLayer(marker_imported_layer, "Imported");
  layerControl.addOverlay(cable_layer, "Cables");
}
