import axios from "axios";
import HttpError from "../models/http-error";

const OPEN_CAGE_API_KEY: string = "your-api-key";

interface Coordinates {
  lat: number;
  lng: number;
}

async function getCoordsForAddress(address: string): Promise<Coordinates> {
  const response = await axios.get(
    `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
      address
    )}&key=${OPEN_CAGE_API_KEY}`
  );

  const data = response.data;

  if (!data.results.length) {
    const error = new HttpError(
      "Could not find location for the specified address.",
      422
    );
    throw error;
  }

  const coordinates = data.results[0].geometry;

  return {
    lat: coordinates.lat,
    lng: coordinates.lng,
  };
}

export default getCoordsForAddress;
