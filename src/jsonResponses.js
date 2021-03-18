const fs = require('fs');

const dataset = fs.readFileSync(`${__dirname}/../src/winrates.csv`, 'utf8');
let newData;

const processDataset = (data) => {
  const allLines = data.split(/\r\n|\n/);
  const returnData = {};

  for (let i = 1; i < allLines.length; i++) {
    const tempData = allLines[i].split(',');
    const champion = tempData[0];
    const role = tempData[2];
    returnData[`${champion} ${role}`] = {};
    returnData[`${champion} ${role}`].champion = champion;
    returnData[`${champion} ${role}`].winrate = parseFloat(tempData[1]);
    returnData[`${champion} ${role}`].role = role;
    returnData[`${champion} ${role}`].matches = parseFloat(tempData[3]);
  }
  return returnData;
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

const getData = (req, res, params) => {
  const responseJSON = {};

  if (!newData[`${params.champion} ${params.role}`]) { // If the entry doesn't exist
    // console.dir(`${params.champion} ${params.role} does not exist.`);
    responseJSON.message = 'The selected champion and role doesn\'t currently have an entry.';
    responseJSON.id = 'missingEntry';
    return respondJSON(req, res, 404, responseJSON);
  } // If it does
  responseJSON.winrate = newData[`${params.champion} ${params.role}`].winrate;
  return respondJSON(req, res, 200, responseJSON);
};

const getDataMeta = (req, res, params) => respondJSONMeta(req, res, newData[`${params.champion} ${params.role}`] ? 200 : 400);

const modifyData = (req, res, body) => {
  const responseJSON = {
    message: 'Selection invalid. The inputted values are invalid.',
  };

  //  If any data in request body is invalid, return 400
  if (!body.champion || !body.role || !body.newWR || !body.games
    || Number.isNaN(body.newWR) || Number.isNaN(parseFloat(body.newWR))
    || Number.isNaN(body.games) || Number.isNaN(parseFloat(body.games))) {
    responseJSON.id = 'badRequest';
    // console.dir('Something missing in request')
    return respondJSON(req, res, 400, responseJSON);
  }

  let responseCode = 201; // Created

  if (newData[`${body.champion} ${body.role}`]) { // If the WR already exists
    responseCode = 204;
    //  # of wins of existing data
    const val1 = newData[`${body.champion} ${body.role}`].matches * (newData[`${body.champion} ${body.role}`].winrate / 100);
    //  # of wins of new Data
    const val2 = body.games * (body.newWR / 100);
    //  Update winrate based on combined data
    newData[`${body.champion} ${body.role}`].winrate = ((val1 + val2) / (parseInt(newData[`${body.champion} ${body.role}`].matches, 10)
      + parseInt(body.games, 10))) * 100;
    newData[`${body.champion} ${body.role}`].matches = newData[`${body.champion} ${body.role}`].matches + body.games;
    //  Send new WR to client
    responseJSON.winrate = newData[`${body.champion} ${body.role}`].winrate;
  } else { // If the WR doesn't exist
    newData[`${body.champion} ${body.role}`] = {};
    newData[`${body.champion} ${body.role}`].champion = body.champion;
    newData[`${body.champion} ${body.role}`].role = body.role;
    newData[`${body.champion} ${body.role}`].winrate = body.newWR;
    newData[`${body.champion} ${body.role}`].matches = body.games;
  }

  if (responseCode === 201) {
    responseJSON.message = 'New Role Data Created Successfully!';
    return respondJSON(req, res, responseCode, responseJSON);
  }
  //  else or if responseCode === 204
  return respondJSONMeta(req, res, responseCode);
};

const notFound = (req, res) => {
  const responseJSON = {
    message: 'The page you are looking for was not found!',
    id: 'notFound',
  };

  return respondJSON(req, res, 404, responseJSON);
};
const notFoundMeta = (req, res) => respondJSONMeta(req, res, 404);

(() => { //  Run this when code loads
  newData = processDataset(dataset);
})();

module.exports = {
  getData,
  getDataMeta,
  modifyData,
  notFound,
  notFoundMeta,
};
