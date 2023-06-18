
const mongoose = require('mongoose');

//this is a single cost model, that goes into a costs collection in db
const costsSchema = new mongoose.Schema({
    user_id:{
      type: Number,
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
    day: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['food', 'health', 'housing', 'sport', 'education', 'transportation', 'other'],
    },
    sum: {
      type: Number,
      required: true,
    },
  });

module.exports = mongoose.model('Costs', costsSchema);
