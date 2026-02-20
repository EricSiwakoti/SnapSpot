import { Request, Response, NextFunction } from "express";
import HttpError from "../models/http-error";
import { validationResult } from "express-validator";
import { v2 as cloudinary } from "cloudinary";
import getCoordsForAddress from "../util/location";
import mongoose from "mongoose";
import Place from "../models/place";
import User from "../models/user";

const getPlaces = async (req: Request, res: Response, next: NextFunction) => {
  let places;
  try {
    const searchQuery = req.query.search as string;

    if (searchQuery) {
      // Case-insensitive regex search on title or address
      places = await Place.find({
        $or: [
          { title: { $regex: searchQuery, $options: "i" } },
          { address: { $regex: searchQuery, $options: "i" } },
        ],
      });
    } else {
      places = await Place.find();
    }
  } catch (error) {
    return next(
      new HttpError("Something went wrong, could not find places.", 500),
    );
  }
  res.json({ places: places.map((p) => p.toObject({ getters: true })) });
};

const getPlaceById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    return next(
      new HttpError("Something went wrong, could not find a place.", 500),
    );
  }

  if (!place) {
    throw new HttpError("Could not find a place for the provided id.", 404);
  }

  res.json({ place: place.toObject({ getters: true }) });
};

const getPlaceByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.params.uid;

  let userWithPlaces;
  try {
    userWithPlaces = await User.findById(userId).populate("places");
  } catch (error) {
    return next(
      new HttpError("Fetching places failed, please try again later.", 500),
    );
  }

  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    return next(
      new HttpError("Could not find a place for the provided user id.", 404),
    );
  }

  res.json({
    places: userWithPlaces.places.map((place) =>
      (place as any).toObject({ getters: true }),
    ),
  });
};

const createPlace = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422),
    );
  }
  const { title, description, address } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: req.file ? req.file.path : undefined,
    creator: req.userData ? req.userData.userId : undefined,
  });

  let user;
  try {
    user = await User.findById(req.userData ? req.userData.userId : undefined);
  } catch (error) {
    return next(new HttpError("Creating place failed, please try again.", 500));
  }

  if (!user) {
    return next(new HttpError("Could not find user for provided id.", 404));
  }
  let sess;
  try {
    sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace._id as any);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (error) {
    if (sess) {
      await sess.abortTransaction();
    }
    return next(new HttpError("Creating place failed, please try again.", 500));
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422),
    );
  }
  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
    if (!place) {
      return next(
        new HttpError("Could not find a place for the provided id.", 404),
      );
    }
  } catch (error) {
    return next(
      new HttpError("Something went wrong, could not update place.", 500),
    );
  }

  let userIdCheck;
  userIdCheck = req.userData ? req.userData.userId : undefined;
  if (!userIdCheck) {
    return next(new HttpError("User not authenticated.", 401));
  }

  if (place.creator.toString() !== userIdCheck) {
    return next(new HttpError("You are not allowed to edit this place.", 401));
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (error) {
    return next(
      new HttpError("Something went wrong, could not update place.", 500),
    );
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req: Request, res: Response, next: NextFunction) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId).populate("creator");
  } catch (error) {
    return next(
      new HttpError("Something went wrong, could not delete place.", 500),
    );
  }

  if (!place) {
    return next(new HttpError("Could not find place for this id.", 404));
  }

  let userIdCheck;
  userIdCheck = req.userData ? req.userData.userId : undefined;
  if (!userIdCheck) {
    return next(new HttpError("User not authenticated.", 401));
  }

  if (place.creator.id !== userIdCheck) {
    return next(
      new HttpError("You are not allowed to delete this place.", 401),
    );
  }

  const imageUrl = place.image;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    try {
      const creator = place.creator as any;
      await place.deleteOne({ session: sess });
      creator.places.pull(place);
      await creator.save({ session: sess });
      await sess.commitTransaction();
    } catch (error) {
      await sess.abortTransaction();
      throw error;
    } finally {
      sess.endSession();
    }
  } catch (error) {
    return next(
      new HttpError("Something went wrong, could not delete place.", 500),
    );
  }

  // Delete from Cloudinary using Public ID extracted from URL
  if (imageUrl) {
    try {
      // Extract public_id from Cloudinary URL
      const urlParts = imageUrl.split("/");
      const uploadIndex = urlParts.indexOf("upload");
      if (uploadIndex !== -1) {
        const publicIdWithExt = urlParts.slice(uploadIndex + 2).join("/");
        const publicId = publicIdWithExt.split(".")[0];

        await cloudinary.uploader.destroy(publicId);
      }
    } catch (err) {
      console.error("Cloudinary deletion failed:", err);
    }
  }

  res.status(200).json({ message: "Deleted place." });
};

export {
  getPlaces,
  getPlaceById,
  getPlaceByUserId,
  createPlace,
  updatePlace,
  deletePlace,
};
