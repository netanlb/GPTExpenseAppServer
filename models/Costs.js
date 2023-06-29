const mongoose = require("mongoose");

//this is a single cost model, that goes into a costs collection in db
const costsSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: [
      "Housing",
      "Utilities",
      "Food",
      "Transportation",
      "Healthcare",
      "Education",
      "Entertainment",
      "Personal Care",
      "Clothing",
      "Investments",
      "Other",
    ],
  },
  sum: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Costs", costsSchema);
