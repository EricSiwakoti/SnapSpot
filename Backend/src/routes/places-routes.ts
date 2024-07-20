import express from "express";
import * as placesControllers from "../controllers/places-controllers";

const router = express.Router();

router.get("/:pid", placesControllers.getPlaceById);

router.get("/user/:uid", placesControllers.getPlaceByUserId);

router.post("/", placesControllers.createPlace);

router.patch("/:pid", placesControllers.updatePlace);

router.delete("/:pid", placesControllers.deletePlace);

export default router;
