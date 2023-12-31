const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
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
      "Groceries",
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
  transactionType: {
    type: String,
    requred: true,
    enum: ["expense", "income", "saving"],
  },
  sum: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Transaction", transactionSchema);
