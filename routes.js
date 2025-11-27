import express from "express";
import { aboutController } from "./controllers/about-controller.js";
import { accountController } from "./controllers/account-controller.js";
import { dashboardController } from "./controllers/dashboard-controller.js";
import { stationController } from "./controllers/station-controller.js";
import { reportController } from "./controllers/report-controller.js";
import { forecastController } from "./controllers/forecast-controller.js";

export const router = express.Router();

// simple auth guard: blocks pages if not logged in
const requireAuth = (request, response, next) => {
  if (!request.session || !request.session.user) {
    return response.redirect("/login");
  }
  next();
};

// root: send user to dashboard if logged in, else login page
router.get("/", (request, response) => {
  if (request.session?.user) {
    return response.redirect("/dashboard");
  }
  return response.redirect("/login");
});

// about page
router.get("/about", aboutController.index);

// auth routes
router.get("/signup", accountController.showSignup);
router.post("/signup", accountController.signup);

router.get("/login", accountController.showLogin);
router.post("/login", accountController.login);

router.get("/logout", accountController.logout);

// account settings: view and update profile
router.get("/account", requireAuth, accountController.settings);
router.post("/account/update", requireAuth, accountController.update);

// dashboard: shows city cards sorted alphabetically)
router.get("/dashboard", requireAuth, dashboardController.index);

// station crud: create, open, delete cities/stations
router.post("/station", requireAuth, stationController.createStation);
router.get("/station/:id", requireAuth, stationController.index);
router.post("/station/:id/delete", requireAuth, stationController.deleteStation);

// manual weather report: save reading from form
router.post("/station/:id/report", requireAuth, reportController.createReport);

// delete a manual weather report by id
router.post("/station/:id/report/:reportId/delete", requireAuth, reportController.deleteReport);

// optional: get delete for simple link delete later
router.get("/station/:id/report/:reportId/delete", requireAuth, reportController.deleteReport);

// auto generate: redirect to forecast page (api reading)
router.post("/station/:id/autogen", requireAuth, reportController.autoGenerateReport);
router.get("/station/:id/autogen", requireAuth, reportController.autoGenerateReport);

// forecast page: displays weather forecast for station
router.get("/station/:id/forecast", requireAuth, forecastController.forecast);

// 404 fallback page if route not found
router.use((request, response) => {
  response.status(404).render("error-view", {
    title: "not found",
    message: "route not found.",
  });
});
