import { StudentTasksController } from "../controllers/studentTasks.controller.js";
import { authMiddleware, roleMiddleware } from "../middleware/auth.middleware.js";

router.get("/pending-tasks", authMiddleware,roleMiddleware(["estudiante"]),StudentTasksController.getPendingTasks);
