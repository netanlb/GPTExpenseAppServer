const express = require("express");
const router = express.Router();
const Costs = require("../models/Costs");
const {
  computedCostsModel,
  costInfoComputedModel,
} = require("../models/ComputedCosts");

// Update a cost by ID
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { user_id, date, description, category, sum } = req.body;

  try {
    const updatedCost = await Costs.findByIdAndUpdate(
      id,
      {
        user_id,
        date,
        description,
        category,
        sum,
      },
      { new: true }
    );

    if (!updatedCost) {
      return res.status(404).json({ message: "Cost not found" });
    }

    res.json(updatedCost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a cost by ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCost = await Costs.findByIdAndRemove(id);

    if (!deletedCost) {
      return res.status(404).json({ error: "Cost not found" });
    }

    res.status(200).json({ message: "Cost deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//get all costs, must send at least user_id
router.get("/", async (req, res) => {
  const { year, month, category, user_id } = req.query;

  try {
    let query = { user_id: user_id };
    let dateQuery = [];

    // handle multiple years and months
    if (year || month) {
      const years = Array.isArray(year) ? year : [year];
      const months = Array.isArray(month) ? month : [month];

      // Create a date range for each year and month
      for (let y of years) {
        for (let m of months) {
          y = parseInt(y);
          m = parseInt(m);
          if (isNaN(m)) {
            let startDate = new Date(y, 0);
            let endDate = new Date(y + 1, 0);

            dateQuery.push({ date: { $gte: startDate, $lt: endDate } });
            break;
          }

          let startDate = new Date(y, m);
          let endDate = new Date(y, m + 1); // This will be the first day of the next month
          dateQuery.push({ date: { $gte: startDate, $lt: endDate } });
        }
      }

      // If dateQuery array is not empty, add it to the main query
      if (dateQuery.length > 0) {
        query.$or = dateQuery;
      }
    }

    // handle multiple categories
    if (category) {
      query.category = Array.isArray(category) ? { $in: category } : category;
    }

    // find and sort in descending order of date
    const costs = await Costs.find(query).sort({ date: -1 });

    res.status(200).json(costs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//addcost post
//summery - first adding the cost to the Costs collection
//second we create a "CostInfoComputed" instance that represent our new cost (this instance goes into the categories lists)
//then according to the computed pattern, need to store the cost into "ComputedCosts"
//document (in the respective collection) - so check if the user_id,month and year have a ComputedCosts on the db,
//if not - create one with the appropriate CostInfoComputed inside the needed array and save it to db,
//if the document exist, then just update the "CostInfoComputed" object to the needed array inside
router.post("/", async (req, res) => {
  try {
    checkAddcostSchema(req.body);

    const { user_id, description, category, sum } = req.body;
    const datestring = req.body.date;

    const date = new Date(datestring);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    //the ComputedCosts header (the identifier)
    const computedHeader = `${user_id}-${year}-${month}`;

    const cost_instance = new Costs({
      user_id,
      date,
      description,
      category,
      sum,
    });

    //save to db the cost instance
    const savedCost = await cost_instance.save();

    console.log("cost_instance.save()");

    // //need the cost info item for the computed costs
    // const costItemForComputedCosts = new costInfoComputedModel({
    //   day: day,
    //   description: description,
    //   sum: sum,
    // });

    // //check if the computed costs object is already in db
    // const computedCostsFromDB = await computedCostsModel.findOne({
    //   header: computedHeader,
    // });

    // console.log("ComputedCosts.findOne({header: computedHeader}");

    // if (computedCostsFromDB == null) {
    //   //need to add to db a new ComputedCosts for the given user_id, month and year
    //   //because there is no document like it in db

    //   console.log("if if if");

    //   const newComputedCosts = getNewComputedCosts(
    //     computedHeader,
    //     category,
    //     costItemForComputedCosts
    //   );

    //   await newComputedCosts.save();

    //   console.log("newComputedCosts.save()");
    // } else {
    //   console.log("else else");
    //   //ComputedCosts already in db, so need to update in db, first add the costItemForComputedCosts
    //   addCostItemToComputedCosts(
    //     computedCostsFromDB,
    //     category,
    //     costItemForComputedCosts
    //   );

    //   //now update the change
    //   await computedCostsModel.findOneAndUpdate(
    //     { header: computedHeader },
    //     computedCostsFromDB,
    //     { upsert: true }
    //   );

    //   console.log("computedCostsFromDB.save()");
    // }

    res.status(200).json(savedCost);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// //creates and returns a new empty instance of ComputedCosts and add the CostInfoComputed into the needed array inside
// function getNewComputedCosts(computedHeader, category, costItem) {
//   const computedCosts_instance = new computedCostsModel({
//     header: computedHeader,
//     food: [],
//     health: [],
//     housing: [],
//     sport: [],
//     education: [],
//     transportation: [],
//     other: [],
//   });

//   console.log("getNewComputedCosts");
//   computedCosts_instance[category].push(costItem);

//   console.log("getNewComputedCosts push");

//   return computedCosts_instance;
// }

// //the ComputedCost is already inside the db, so add to the instance we got from db the CostInfo
// function addCostItemToComputedCosts(computedCostsFromDB, category, costItem) {
//   computedCostsFromDB[category].push(costItem);
//   console.log("addCostItemToComputedCosts");
// }

//check if we got all the params needed to run all needed stuff
function checkAddcostSchema(cost) {
  if (!cost.user_id) {
    throw new Error("no user_id");
  }
  if (!cost.date) {
    throw new Error("no date");
  }

  if (!cost.description) {
    throw new Error("no description");
  }
  if (!cost.category) {
    throw new Error("no category");
  }
  if (!cost.sum) {
    throw new Error("no sum");
  }
}

module.exports = router;
