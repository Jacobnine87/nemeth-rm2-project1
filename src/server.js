const http = require('http');
const url = require('url');
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const handlePost = (req, res, parsedUrl) => {
  if (parsedUrl.pathname === '/updateWR') {
    const body = [];

    req.on('error', () => {
      // Eslint doesn't like console.dir(err)
      res.statusCode = 400;
      res.end();
    });

    req.on('data', (chunk) => {
      body.push(chunk);
    });

    req.on('end', () => {
      const bodyString = Buffer.concat(body).toString();
      const bodyParams = query.parse(bodyString);

      jsonHandler.modifyData(req, res, bodyParams);
    });
  }
};

const handleHead = (req, res, parsedUrl) => {
  switch (parsedUrl.pathname) {
    case '/getData': {
      const params = JSON.parse(
        `{"${decodeURI(parsedUrl.query)
          .replace(/"/g, '\\"')
          .replace(/&/g, '","')
          .replace(/=/g, '":"')}"}`,
      );
      jsonHandler.getDataMeta(req, res, params);
      break;
    }
    case '/notReal':
    default:
      jsonHandler.notFoundMeta(req, res);
      break;
  }
};

const handleGet = (req, res, parsedUrl) => {
  switch (parsedUrl.pathname) {
    case '/':
      htmlHandler.getIndex(req, res);
      break;
    case '/style.css':
      htmlHandler.getCSS(req, res);
      break;
    case '/script.js':
      htmlHandler.getScript(req, res);
      break;
    case '/getData': {
      const params = JSON.parse(
        `{"${decodeURI(parsedUrl.query)
          .replace(/"/g, '\\"')
          .replace(/&/g, '","')
          .replace(/=/g, '":"')}"}`,
      );
      // Credit: https://stackoverflow.com/a/8649003/14783530
      jsonHandler.getData(req, res, params);
      break;
    }
    default:
      jsonHandler.notFound(req, res);
      break;
  }
};

const onRequest = (req, res) => {
  const parsedUrl = url.parse(req.url);
  //console.dir(`${req.method} -> ${parsedUrl.pathname}`);

  switch (req.method) {
    case 'POST':
    case 'post':
      handlePost(req, res, parsedUrl);
      break;
    case 'HEAD':
    case 'head':
      handleHead(req, res, parsedUrl);
      break;
    default:
      handleGet(req, res, parsedUrl);
      break;
  }
};

http.createServer(onRequest).listen(port);
