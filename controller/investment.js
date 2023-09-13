const Investment = require("../models/Investment");
const User = require("../models/User");
var axios = require("axios");
const cron = require("node-cron");
const { StatusCodes } = require("http-status-codes");

const getInvestment = async (req, res) => {
  try {
    const { schema_id } = req.params;
    const query = { user_id: req.user.user_id };

    if (schema_id) {
      query.schema_id = schema_id;
    }

    const fiveMinutesAgo = new Date();
    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

    query.createdAt = { $lt: fiveMinutesAgo };

    const investments = await Investment.find(query);
    res.status(StatusCodes.OK).json({ success: true, data: investments });
  } catch (error) {
    console.log(error);
    res.send({ success: false, err: error });
  }
};

const addInvestment = async (req, res) => {
  try {
    const fundDetail = await axios.get(
      "https://groww.in/v1/api/data/mf/web/v2/scheme/search/" +
        req.body.schema_id,
      { params: { include_swp_frequency: false } }
    );

    const resp = await axios.get(
      "https://groww.in/v1/api/data/mf/web/v1/scheme/" +
        fundDetail.data.scheme_code +
        "/graph",
      { params: { benchmark: false, months: 10000 } }
    );

    const currentDateNAV = resp.data.folio.data
      .map((item) => ({
        date: item[0],
        nav: item[1],
      }))
      .find((ele) => ele.date === new Date(req.body.date).getTime());

    if (currentDateNAV) {
      let isParent = true;

      if (req.body.type === "sip") {
        const existingInvestment = await Investment.findOne({
          user_id: req.user.user_id,
          schema_id: req.body.schema_id,
        });

        if (existingInvestment) {
          isParent = false;
        }
      }

      const savedInvestment = await Investment.create({
        user_id: req.user.user_id,
        schema_id: req.body.schema_id,
        schema_name: fundDetail.data.scheme_name,
        nav: currentDateNAV.nav,
        type: req.body.type,
        date: req.body.date,
        is_parent: isParent,
        amount: req.body.amount,
      });

      res
        .status(StatusCodes.CREATED)
        .json({ success: true, data: savedInvestment });
    } else {
      res
        .status(StatusCodes.BAD_GATEWAY)
        .json({ success: false, error: "NAV not found" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

const updateCurrentValue = async (req, res) => {
  try {
    const allInvestment = await Investment.find({ active: true });
    const uniqueSchemaIds = [
      ...new Set(allInvestment.map((item) => item.schema_id)),
    ];

    let navOfSchema = [];

    for (const ele of uniqueSchemaIds) {
      const fundDetail = await axios.get(
        "https://groww.in/v1/api/data/mf/web/v2/scheme/search/" + ele,
        { params: { include_swp_frequency: false } }
      );

      navOfSchema.push({ schema_id: ele, nav: fundDetail.data.nav });
    }

    for (const investment of allInvestment) {
      const schemaData = navOfSchema.find(
        (schema) => schema.schema_id == investment.schema_id
      );

      if (schemaData) {
        investment.current_nav = schemaData.nav;
        investment.current_value = (
          (investment.current_nav * investment.amount) /
          investment.nav
        ).toFixed(2);

        await investment.save();
      }
    }
  } catch (error) {
    console.error(error);
  }
};

cron.schedule("*/5 * * * *", () => {
  // updateCurrentValue()
  //   .then(() =>
  //     console.log("updateCurrentValue function executed successfully")
  //   )
  //   .catch((error) =>
  //     console.error("Error executing updateCurrentValue:", error)
  //   );
});

module.exports = { getInvestment, addInvestment };
