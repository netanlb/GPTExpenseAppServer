const mongoose = require("mongoose");

// This is a single object that goes inside the categories list in the computedCostsSchema
const CostInfoComputedSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  sum: {
    type: Number,
    required: true,
  },
});

// This is the computed costs of all the costs (group by category) for a single month in a year (for a single user_id)
// saved in the computedcosts collection in db (the report is reading this object)
const computedCostsSchema = new mongoose.Schema({
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
  groupedCategory: [CostInfoComputedSchema], // This is an array of CostInfoComputed documents
});

// Create the models
const computedCostsModel = mongoose.model("ComputedCosts", computedCostsSchema);
const costInfoComputedModel = mongoose.model(
  "CostInfoComputed",
  CostInfoComputedSchema
);

module.exports = { computedCostsModel, costInfoComputedModel };
