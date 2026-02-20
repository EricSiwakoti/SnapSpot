import { Request, Response, NextFunction } from "express";
import HttpError from "../models/http-error";
import Place from "../models/place";
import User from "../models/user";

const searchAll = async (req: Request, res: Response, next: NextFunction) => {
  const { query, type } = req.query; // type: 'places', 'users', or 'all'

  if (!query || typeof query !== "string") {
    return next(new HttpError("Search query is required.", 400));
  }

  const searchTerm = query.trim();
  const searchType =
    type === "users" ? "users" : type === "places" ? "places" : "all";

  try {
    const results: { places?: any[]; users?: any[] } = {};

    // Search Places
    if (searchType === "all" || searchType === "places") {
      const places = await Place.find({
        $or: [
          { title: { $regex: searchTerm, $options: "i" } },
          { address: { $regex: searchTerm, $options: "i" } },
          { description: { $regex: searchTerm, $options: "i" } },
        ],
      });
      results.places = places.map((p) => p.toObject({ getters: true }));
    }

    // Search Users
    if (searchType === "all" || searchType === "users") {
      const users = await User.find(
        { name: { $regex: searchTerm, $options: "i" } },
        "-password",
      );
      results.users = users.map((u) => u.toObject({ getters: true }));
    }

    res.json({ results });
  } catch (error) {
    return next(new HttpError("Search failed, please try again.", 500));
  }
};

export { searchAll };
