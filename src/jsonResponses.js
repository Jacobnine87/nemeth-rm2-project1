const fs = require('fs');

const dataset = fs.readFileSync(`${__dirname}/../src/winrates.csv`, 'utf8');
let processedDataset;

const processDataset = (data) => {
  const allLines = data.split(/\r\n|\n/);
  const headers = allLines[0].split(',');
  const newData = {};

  for(let i = 1; i < allLines.length; i++) {
    let tempData = allLines[i].split(',');
    let champion = tempData[0];
    newData[champion] = {};
    newData[champion].champion = champion;
    newData[champion].winrate = parseFloat(tempData[1]);
    newData[champion].role = tempData[2];
    newData[champion].matches = parseFloat(tempData[3]);
  }
  return newData;
};

const respondJSON = (req, res, status, obj) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.write(JSON.stringify(obj));
  res.end();
};

const respondJSONMeta = (req, res, status) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end();
};

const getData = (req, res, body) => {
  const responseJSON = {
    message: 'The selected champion and role doesn\'t currently have an entry.',
  };
  
  console.dir(`Body.champion: ${body.champion}`);
  console.dir(`Dataset has: ${dataset[body.champion]}`);

  if(!processedDataset[body.champion]) { // If the entry doesn't exist
    responseJSON.id = 'missingEntry';
    return respondJSON(req, res, 404, responseJSON);
  } else { // If it does
    responseJSON.winrate = processedDataset[champion].winrate;
    responseJSON.message = `Data retrieved successfully!`;
    return respondJSON(req, res, 200, responseJSON);
  }
};

const getDataMeta = (req, res, body) => respondJSONMeta(req, res, !processedDataset[body.champion] ? 200 : 400);

const getUsersMeta = (req, res) => respondJSONMeta(req, res, 200);

const modifyData = (req, res) => {
  const repsonseJSON = {
    message: 'Selection invalid. Either that role doesn\'t exist for the champion or the inputted values are invalid.',
  };

  if(!body.champion || !body.role || !body.newWR || !body.games
    || !isNaN(body.newWR) || !isNaN(parseFloat(body.newWR)) 
    || !isNaN(body.games) || !isNaN(parseFloat(body.games))) {
    responseJSON.id = 'badRequest';
    return respondJSON(req, res, 400, responseJSON);
  }

  let responseCode = 201; // Created

  if(processedDataset[body.champion]) { // If the WR already exists
    responseCode = 204;
    let val1 = processedDataset[body.champion].matches * (processedDataset[body.champion].winrate/100);
    let val2 = body.games * (body.newWR / 100);
    processedDataset[body.champion].winrate = (val1+val2)/(processedDataset[body.champion].matches 
      + body.games);
    processedDataset[body.champion].matches = processedDataset[body.champion].matches + body.games;
    //  Send new WR to client
    responseJSON.winrate = processedDataset[body.champion].winrate;
  } else { // If the WR doesn't exist
    processedDataset[body.champion] = {};
    processedDataset[body.champion].champion = body.champion;
    processedDataset[body.champion].role = body.role;
    processedDataset[body.champion].winrate = body.newWR;
    processedDataset[body.champion].matches = body.games;
  }

  if(responseCode === 201) {
    responseJSON.message = 'New Role Data Created Successfully!';
    return respondJSON(req, res, responseCode, responseJSON);
  }
  //  else or if responseCode === 204
  return respondJSONMeta(req, res, responseCode);
}

const notFound = (req, res) => {
  const responseJSON = {
    message: 'The page you are looking for was not found!',
    id: 'notFound',
  };

  return respondJSON(req, res, 404, responseJSON);
};
const notFoundMeta = (req, res) => respondJSONMeta(req, res, 404);

(() => {  //  Run this when code loads
  processedDataset = processDataset(dataset);
  if(processedDataset) {
    console.dir('Dataset processed!');
  }
})();

module.exports = {
  getData,
  getDataMeta,
  modifyData,
  notFound,
  notFoundMeta,
};  
