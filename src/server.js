const http = require('http');
const url = require('url');
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const handlePost = (req, res, parsedUrl) => {
  if (parsedUrl.pathname === '/addUser') {
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

      jsonHandler.addUser(req, res, bodyParams);
    });
  }
};

const handleHead = (req, res, parsedUrl) => {
  switch (parsedUrl.pathname) {
    case '/getData':
      jsonHandler.getUsersMeta(req, res);
      break;
    case '/notReal':
    default:
      jsonHandler.notFoundMeta(req, res);
      break;
  }
};

const handleGet = (req, res, parsedUrl) => {
  switch(parsedUrl.pathname) {
    case '/':
      htmlHandler.getIndex(req, res);
      break;
    case '/style.css':
      htmlHandler.getCSS(req, res);
      break;
    case '/script.js':
      htmlHandler.getScript(req, res);
      break;
    case '/getData':
      const body = [];

      req.on('error', () => {
        res.statusCode = 400;
        res.end();
      });

      req.on('data', (chunk) => {
        body.push(chunk);
      });

      req.on('end', () => {
        const bodyString = Buffer.concat(body).toString();
        const bodyParams = query.parse(bodyString);
        console.log(bodyParams);

        jsonHandler.getData(req, res, bodyParams);
      });
      break;
    default:
      jsonHandler.notFound(req, res);
      break;
  }
};

const onRequest = (req, res) => {
  const parsedUrl = url.parse(req.url);
  console.dir(req.method + " " + parsedUrl.pathname);
  if(parsedUrl.query) {
    console.dir(parsedUrl.query);
  }

  switch(req.method) {
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
