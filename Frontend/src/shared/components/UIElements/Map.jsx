import { useRef, useEffect } from "react";
import Map from "ol/Map.js";
import OSM from "ol/source/OSM.js";
import TileLayer from "ol/layer/Tile.js";
import View from "ol/View.js";
import { fromLonLat } from "ol/proj.js";
import "./Map.css";

const ViewMap = (props) => {
  const mapRef = useRef();
  const { center, zoom } = props;

  useEffect(() => {
    const transformedCenter = fromLonLat([center.lng, center.lat]);

    const map = new Map({
      target: mapRef.current.id,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: transformedCenter,
        zoom: zoom,
      }),
    });

    mapRef.current = map;
  }, [center, zoom]);

  return (
    <div
      ref={mapRef}
      className={`map ${props.className}`}
      style={props.style}
      id="map"
    ></div>
  );
};

export default ViewMap;
