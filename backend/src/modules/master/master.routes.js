const express = require("express");

const router = express.Router();

const {
    getStates,
    getLocations,
    getLawAreas,
    getActRules,
    getCompliances,
    getMasterList,
    createMasterItem,
} = require("./master.controller");

router.get("/states", getStates);

router.get(
    "/locations/:stateId",
    getLocations
);

router.get(
    "/law-areas",
    getLawAreas
);

router.get(
    "/act-rules/:lawAreaId",
    getActRules
);

router.get(
    "/compliances/:actRuleId",
    getCompliances
);

router.get(
    "/:type",
    getMasterList
);

router.post(
    "/:type",
    createMasterItem
);

module.exports = router;
