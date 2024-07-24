import mongoose from "mongoose";

interface ILocation {
  lat: number;
  lng: number;
}

interface IPlace {
  title: string;
  description: string;
  image: string;
  address: string;
  location: ILocation;
  creator: string;
}

const placeSchema = new mongoose.Schema<IPlace>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  creator: { type: String, required: true },
});

const Place = mongoose.model<IPlace>("Place", placeSchema);

export default Place;
