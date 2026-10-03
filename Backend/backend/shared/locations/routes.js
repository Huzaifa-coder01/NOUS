const express = require("express");
const {
  getCountries,
  getStatesByCountryId,
  getCitiesByStateId,
  getCitiesByCountryId,
} = require("./locationsController");
const createRateLimiter = require("../../helperUtils/rateLimiter");

const router = express.Router();
const apiRateLimiterCountries = createRateLimiter("countries");
const apiRateLimiterCities = createRateLimiter("cities");
const apiRateLimiterStates = createRateLimiter("states");

router.get("/countries", apiRateLimiterCountries, getCountries);
router.get("/states/:countryId", apiRateLimiterStates, getStatesByCountryId);
router.get("/cities/:stateId", apiRateLimiterCities, getCitiesByStateId);
router.get("/cities/country/:countryId", apiRateLimiterCities, getCitiesByCountryId);

module.exports = router;
