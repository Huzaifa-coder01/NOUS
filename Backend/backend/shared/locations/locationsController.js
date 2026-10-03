const fs = require("fs");
const path = require("path");
const { sendResponse } = require("../../helperUtils/responseUtil");

const countriesFilePath = path.join(__dirname, "../../assets/countries.json");

const readJSONFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {

    return null;
  }
};

const countriesData = readJSONFile(countriesFilePath);

const getCountries = (req, res) => {
  if (countriesData) {
    const countries = countriesData.map((country) => ({
      id: country.id,
      name: country.name,
    }));
    countries.sort((a, b) => a.name.localeCompare(b.name));
    return sendResponse({
      res,
      statusCode: 200,
      translationKey: "countries_fetched_successfully",
      data: countries,
    });
  } else {
    return sendResponse({
      res,
      statusCode: 500,
      translationKey: "error_reading_countries_data",
    });
  }
};

const getStatesByCountryId = (req, res) => {
  const countryId = parseInt(req.params.countryId);
  const country = countriesData.find((country) => country.id === countryId);

  if (country && country.states) {
    country.states.sort((a, b) => a.name.localeCompare(b.name));
  }

  if (country) {
    return sendResponse({
      res,
      statusCode: 200,
      translationKey: "states_fetched_successfully",
      data: country.states || [],
    });
  } else {
    return sendResponse({
      res,
      statusCode: 404,
      translateMessage: false,
      translationKey: "country_not_found",
    });
  }
};

const getCitiesByStateId = (req, res) => {
  const stateId = parseInt(req.params.stateId);
  let state;

  countriesData.forEach((country) => {
    const foundState = country.states.find((state) => state.id === stateId);
    if (foundState) {
      state = foundState;
    }
  });

  if (state) {
    if (state.cities) {
      state.cities.sort((a, b) => a.name.localeCompare(b.name));
    }
    return sendResponse({
      res,
      statusCode: 200,
      translationKey: "cities_fetched_successfully",
      data: state.cities || [],
    });
  } else {
    return sendResponse({
      res,
      statusCode: 404,
      translateMessage: false,
      translationKey: "state_not_found",
    });
  }
};

const getCitiesByCountryId = (req, res) => {
  const countryId = parseInt(req.params.countryId);
  const country = countriesData.find((country) => country.id === countryId);

  if (country) {
    const cities = country.states.reduce((acc, state) => {
      return acc.concat(state.cities || []);
    }, []);
    cities.sort((a, b) => a.name.localeCompare(b.name));
    return sendResponse({
      res,
      statusCode: 200,
      translationKey: "cities_fetched_successfully",
      data: cities,
    });
  } else {
    return sendResponse({
      res,
      statusCode: 404,
      translationKey: "country_not_found",
    });
  }
};



module.exports = {
  getCountries,
  getStatesByCountryId,
  getCitiesByStateId,
  getCitiesByCountryId,
};
