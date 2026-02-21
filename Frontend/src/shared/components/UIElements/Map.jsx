import { useRef, useEffect } from "react";
import Map from "ol/Map.js";
import OSM from "ol/source/OSM.js";
import TileLayer from "ol/layer/Tile.js";
import View from "ol/View.js";
import { fromLonLat } from "ol/proj.js";
import "ol/ol.css";
import "./Map.css";

const ViewMap = (props) => {
  const mapRef = useRef();
  const mapInstanceRef = useRef(null);
  const { center, zoom } = props;

  useEffect(() => {
    // Initialize the map only once when the component mounts
    if (!mapInstanceRef.current && mapRef.current) {
      const transformedCenter = fromLonLat([center.lng, center.lat]);
      mapInstanceRef.current = new Map({
        target: mapRef.current, // Pass DOM element directly
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
    }

    // Update the map view when center or zoom changes
    if (mapInstanceRef.current && center) {
      const transformedCenter = fromLonLat([center.lng, center.lat]);
      mapInstanceRef.current.getView().setCenter(transformedCenter);
      mapInstanceRef.current.getView().setZoom(zoom);
    }

    // Cleanup function to dispose of the map instance when the component unmounts
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(null);
        mapInstanceRef.current = null;
      }
    };
  }, [center, zoom]);

  return (
    <div
      ref={mapRef}
      className={`map ${props.className}`}
      style={props.style}
    ></div>
  );
};

export default ViewMap;
