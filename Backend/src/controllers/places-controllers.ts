import HttpError from "../models/http-error";
import { Request, Response, NextFunction } from "express";
import { v4 as uuid } from "uuid";

interface Location {
  lat: number;
  lng: number;
}

interface Place {
  id: string;
  title: string;
  description: string;
  location: Location;
  address: string;
  creator: string;
}

const DUMMY_PLACES: Place[] = [
  {
    id: "p1",
    title: "Empire State Building",
    description: "One of the most famous sky scrapers in the world!",
    location: {
      lat: 40.7484474,
      lng: -73.9871516,
    },
    address: "20 W 34th St, New York, NY 10001",
    creator: "u1",
  },
];

const getPlaceById = (req: Request, res: Response, next: NextFunction) => {
  const placeId = req.params.pid;

  const place = DUMMY_PLACES.find((p) => {
    return p.id === placeId;
  });

  if (!place) {
    throw new HttpError("Could not find a place for the provided id.", 404);
  }

  res.json({ place });
};

const getPlaceByUserId = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.uid;

  const place = DUMMY_PLACES.find((p) => {
    return p.creator === userId;
  });

  if (!place) {
    return next(
      new HttpError("Could not find a place for the provided user id.", 404)
    );
  }

  res.json({ place });
};

const createPlace = (req: Request, res: Response, next: NextFunction) => {
  const { title, description, coordinates, address, creator } = req.body;

  const createdPlace: Place = {
    id: uuid(),
    title,
    description,
    location: coordinates,
    address,
    creator,
  };

  DUMMY_PLACES.push(createdPlace);

  res.status(201).json({ place: createdPlace });
};

export { getPlaceById, getPlaceByUserId, createPlace };
