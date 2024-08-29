import express from "express";
import * as placesControllers from "../controllers/places-controllers";
import { check } from "express-validator";
import fileUpload from "../middleware/file-upload";
import authMiddleware from "../middleware/check-auth";

const router = express.Router();

router.get("/:pid", placesControllers.getPlaceById);
router.get("/user/:uid", placesControllers.getPlaceByUserId);
router.use(authMiddleware);

router.post(
  "/",
  fileUpload.single("image"),
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
  ],
  placesControllers.createPlace
);

router.patch(
  "/:pid",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  placesControllers.updatePlace
);

router.delete("/:pid", placesControllers.deletePlace);

export default router;
