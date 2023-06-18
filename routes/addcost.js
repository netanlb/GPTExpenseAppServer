
const express = require('express');
const router = express.Router();
const Costs = require('../models/Costs');
const {computedCostsModel, costInfoComputedModel}  = require('../models/ComputedCosts');


//addcost post
//summery - first adding the cost to the Costs collection 
//second we create a "CostInfoComputed" instance that represent our new cost (this instance goes into the categories lists)
//then according to the computed pattern, need to store the cost into "ComputedCosts" 
//document (in the respective collection) - so check if the user_id,month and year have a ComputedCosts on the db,
//if not - create one with the appropriate CostInfoComputed inside the needed array and save it to db,
//if the document exist, then just update the "CostInfoComputed" object to the needed array inside
router.post('/', async (req, res) => {
  try {
    checkAddcostSchema(req.body);
    
    const user_id = req.body.user_id;
    const year = req.body.year;
    const month = req.body.month;
    const day = req.body.day;
    const description = req.body.description;
    const category = req.body.category;
    const sum = req.body.sum;

    //the ComputedCosts header (the identifier)
    const computedHeader = `${user_id}-${year}-${month}`;

    const cost_instance = new Costs({ user_id: user_id, year: year, month: month, day:day, description: description, category:category, sum:sum });

    //save to db the cost instance
    await cost_instance.save();

  console.log('cost_instance.save()');

    //need the cost info item for the computed costs
    const costItemForComputedCosts = new costInfoComputedModel({day: day, description:description, sum:sum});

    //check if the computed costs object is already in db
    const computedCostsFromDB = await computedCostsModel.findOne({header: computedHeader});

  console.log('ComputedCosts.findOne({header: computedHeader}');

    if(computedCostsFromDB == null){
        //need to add to db a new ComputedCosts for the given user_id, month and year
        //because there is no document like it in db
        
         console.log('if if if');

         const newComputedCosts = getNewComputedCosts(computedHeader, category, costItemForComputedCosts);

         await newComputedCosts.save();
         
         console.log('newComputedCosts.save()');
    }
    else{
        
    console.log('else else');
        //ComputedCosts already in db, so need to update in db, first add the costItemForComputedCosts
        addCostItemToComputedCosts(computedCostsFromDB, category, costItemForComputedCosts);

        //now update the change
        await computedCostsModel.findOneAndUpdate({header: computedHeader}, computedCostsFromDB, {upsert: true});

    console.log('computedCostsFromDB.save()');
    }

    res.status(200).json();

  } catch (err) {
    res.status(400).send(err.message);
  }
});

//creates and returns a new empty instance of ComputedCosts and add the CostInfoComputed into the needed array inside
function getNewComputedCosts(computedHeader, category, costItem){
    const computedCosts_instance = new computedCostsModel({ header: computedHeader, food:[],health:[],housing:[],sport:[],education:[],transportation:[],other:[] });
    
  console.log('getNewComputedCosts');
    computedCosts_instance[category].push(costItem);
    
  console.log('getNewComputedCosts push');

    return computedCosts_instance;
}

//the ComputedCost is already inside the db, so add to the instance we got from db the CostInfo
function addCostItemToComputedCosts(computedCostsFromDB, category, costItem){
    computedCostsFromDB[category].push(costItem);
  console.log('addCostItemToComputedCosts');
}

//check if we got all the params needed to run all needed stuff
function checkAddcostSchema(cost) {
  if (!cost.user_id) {
    throw new Error('no user_id');
  }
  if (!cost.year) {
    throw new Error('no year');
  }

  if (!cost.month ) {
    throw new Error('no month');
  } else{
    if(Number(cost.month) > 12 || Number(cost.month) < 1){
            throw new Error('month incorrect');
    }
  }

  if (!cost.day) {
    throw new Error('no day');
  }
  else{
    if(Number(cost.day) > 31 || Number(cost.day) < 1){
            throw new Error('day incorrect');
    }
  }

  if (!cost.description) {
    throw new Error('no description');
  }
    if (!cost.category) {
    throw new Error('no category');
  }
      if (!cost.sum) {
    throw new Error('no sum');
  }
}


module.exports = router;
