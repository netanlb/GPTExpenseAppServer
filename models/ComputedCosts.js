
const mongoose = require('mongoose');

//this is a single object that goes inside the categories lists in the computedCostsSchema (see below)
const CostInfoComputedSchema = new mongoose.Schema({
    day:{
        type: Number,
        required: true,
    },
    description: {
      type: String,
      required: true,
    },
    sum: {
      type: Number,
      required: true,
    },

  });

//this is this computed costs of all the costs (group by category) for a single month in a year (for a single user_id)
//saved in the computedcosts collection in db (the report is reading this object)
const computedCostsSchema = new mongoose.Schema({
    header:{
        type: String,
        required: true,
    },
    food: {
      type: [CostInfoComputedSchema],
      required: true,
    },
    health: {
      type: [CostInfoComputedSchema],
      required: true,
    },
    housing: {
      type: [CostInfoComputedSchema],
      required: true,
    },
    sport: {
      type: [CostInfoComputedSchema],
      required: true,
    },
    education: {
      type: [CostInfoComputedSchema],
      required: true,
    },
    transportation: {
      type: [CostInfoComputedSchema],
      required: true,
    },
    other: {
      type: [CostInfoComputedSchema],
      required: true,
    },
  });

  //this is the only way I managed to export both of the models (create 2 consts and exporting them)
  const computedCostsModel =  mongoose.model('ComputedCosts', computedCostsSchema);
  const costInfoComputedModel = mongoose.model('CostInfoComputed', CostInfoComputedSchema);

module.exports =  {computedCostsModel, costInfoComputedModel};
