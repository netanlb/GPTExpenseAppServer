
const express = require('express');
const router = express.Router();
const {computedCostsModel, costInfoComputedModel}  = require('../models/ComputedCosts');

//get detailed report from the same month and year (the report is "ComputedCosts" object in the respective collection in db)
router.get('/', async (req, res) => {

  const year = req.query.year;
  const month = req.query.month;
  const user_id = req.query.user_id;
  
  const computedHeader = `${user_id}-${year}-${month}`;

  try{
    const computedCosts = await computedCostsModel.findOne({header:computedHeader });

    if(computedCosts == null){
      //no document in db, send empty
      return res.status(200).send();
    }
    else{
      
      formmated = getComputedCostsFormmated(computedCosts)
      return res.status(200).json(formmated);
    }
  
    } catch (err) {
    res.status(400).send(err.message);
  }
});

//format the report object from db to match the needed reponse
function getComputedCostsFormmated(computedCosts){

    const foodArr = getFormmatedArray(computedCosts.food);
    const healthArr = getFormmatedArray(computedCosts.health);
    const housingArr = getFormmatedArray(computedCosts.housing);
    const sportArr = getFormmatedArray(computedCosts.sport);
    const educationArr = getFormmatedArray(computedCosts.education);
    const transportationArr = getFormmatedArray(computedCosts.transportation);
    const otherArr = getFormmatedArray(computedCosts.other);
    
    const formmated = {food: foodArr, health: healthArr, housing: housingArr, sport: sportArr, education: educationArr,
                                      transportation: transportationArr, other: otherArr};
    
    
     return formmated;
}

//format each array and return the formmated new array
function getFormmatedArray(initialArray){
  const arr = [];

    for (var i = 0; i < initialArray.length; i++){
      const element = initialArray[i];
      arr.push({day: element.day, description: element.description, sum: element.sum});
  }

  return arr;

}

module.exports = router;
