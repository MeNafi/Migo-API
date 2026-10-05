import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { vehicleController } from "./vehicle.controller";
import { createVehicleSchema, documentSchema, updateVehicleSchema } from "./vehicle.validation";

const router = Router();
const commuter = auth(Role.COMMUTER, Role.ADMIN, Role.SUPER_ADMIN);

router.post("/", commuter, validateRequest(createVehicleSchema), vehicleController.create);
router.get("/", commuter, vehicleController.list);
router.get("/:vehicleId", commuter, vehicleController.get);
router.patch("/:vehicleId", commuter, validateRequest(updateVehicleSchema), vehicleController.update);
router.delete("/:vehicleId", commuter, vehicleController.remove);
router.post("/:vehicleId/documents", commuter, validateRequest(documentSchema), vehicleController.documents);
router.get("/:vehicleId/verification", commuter, vehicleController.verification);
router.post("/:vehicleId/verification/resubmit", commuter, vehicleController.resubmit);

export const vehicleRoutes = router;
