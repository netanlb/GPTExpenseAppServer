const mongoose = require("mongoose");

// This is a single object that goes inside the categories list in the computedCostsSchema
const TransactionInfoComputedSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  sum: {
    type: Number,
    required: true,
  },
});

// This is the computed Transactions of all the Transactions (group by category) for a single month in a year (for a single user_id)
// saved in the computedTransactions collection in db (the report is reading this object)
const computedTransactionsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  month: {
    type: Number,
    required: true,
  },
  groupedCategory: [TransactionInfoComputedSchema], // This is an array of TransactionInfoComputed documents
});

// Create the models
const computedTransactionsModel = mongoose.model(
  "ComputedCosts",
  computedTransactionsSchema
);
const transactionInfoComputedModel = mongoose.model(
  "TransactionInfoComputed",
  TransactionInfoComputedSchema
);

module.exports = { computedTransactionsModel, transactionInfoComputedModel };
