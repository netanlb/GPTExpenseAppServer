const express = require("express");
const router = express.Router();
const Transaction = require("../models/transaction");

// Update a transaction by ID
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { user_id, date, description, category, sum, transactionType } =
    req.body;

  try {
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      {
        user_id,
        date,
        description,
        category,
        sum,
        transactionType,
      },
      { new: true }
    );

    if (!updatedTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json(updatedTransaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a transaction by ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTransaction = await Transaction.findByIdAndRemove(id);

    if (!deletedTransaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.status(200).json({ message: "Transaction deleted successfully" });
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

    const groupedTransactions = await Transaction.aggregate([
      {
        $match: {
          user_id: user_id,
          date: { $gte: startDate, $lt: endDate }, // Add condition for date
          transactionType: "expense",
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
    res.json(groupedTransactions);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve grouped transactions." });
  }
});

//get all transactions, must send at least user_id
router.get("/", async (req, res) => {
  const { year, month, category, user_id, transactionType } = req.query;

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
    console.log(transactionType);
    if (transactionType) {
      console.log(transactionType);
      query.transactionType = Array.isArray(transactionType)
        ? { $in: transactionType }
        : transactionType;
    }

    // find and sort in descending order of date
    const transactions = await Transaction.find(query).sort({ date: -1 });

    res.status(200).json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  console.log(req);
  try {
    checkAddtransactionSchema(req.body);

    const { user_id, description, category, sum, transactionType } = req.body;
    const datestring = req.body.date;

    const date = new Date(datestring);

    const transaction_instance = new Transaction({
      user_id,
      date,
      description,
      category,
      transactionType,
      sum,
    });

    //save to db the transaction instance
    const savedTransaction = await transaction_instance.save();
    console.log("transaction_instance.save()");

    res.status(200).json(savedTransaction);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

//check if we got all the params needed to run all needed stuff
function checkAddtransactionSchema(transaction) {
  if (!transaction.user_id) {
    throw new Error("no user_id");
  }
  if (!transaction.date) {
    throw new Error("no date");
  }

  if (!transaction.description) {
    throw new Error("no description");
  }
  if (!transaction.category) {
    throw new Error("no category");
  }
  if (!transaction.sum) {
    throw new Error("no sum");
  }
  if (!transaction.transactionType) {
    throw new Error("no transaction type");
  }
}

module.exports = router;
