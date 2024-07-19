import express, { Request, Response, NextFunction } from "express";
import { HttpError } from "../models/http-error";

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

const router = express.Router();

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

router.get("/:pid", (req: Request, res: Response, next: NextFunction) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find((p) => p.id === placeId);

  if (!place) {
    throw new HttpError("Could not find a place for the provided id.", 404);
  }
  res.json({ place });
});

router.get("/user/:uid", (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.uid;
  const place = DUMMY_PLACES.find((p) => p.creator === userId);

  if (!place) {
    return next(
      new HttpError("Could not find a place for the provided user id.", 404)
    );
  }
  res.json({ place });
});

export default router;
