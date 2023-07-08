const express = require("express");
const router = express.Router();
const Costs = require("../models/Costs");

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

router.get("/groupBy", async (req, res) => {
  const { user_id, year, month } = req.query;
  try {
    // Use current year and month if not provided
    let currentYear = year ? Number(year) : new Date().getFullYear();
    let currentMonth = month ? Number(month) : new Date().getMonth();

    // Build start and end date for the query
    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 1);

    const groupedCosts = await Costs.aggregate([
      {
        $match: {
          user_id: user_id,
          date: { $gte: startDate, $lt: endDate }, // Add condition for date
        },
      },
      {
        $group: {
          _id: "$category",
          category: { $first: "$category" },
          totalSum: { $sum: "$sum" },
        },
      },
      {
        $project: {
          _id: 0,
          category: 1,
          totalSum: 1,
        },
      },
    ]);
    res.json(groupedCosts);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve grouped costs." });
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

router.post("/", async (req, res) => {
  try {
    checkAddcostSchema(req.body);

    const { user_id, description, category, sum } = req.body;
    const datestring = req.body.date;

    const date = new Date(datestring);

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

    res.status(200).json(savedCost);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

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
