// The first two lines are for debugging purposes.

const { diag, DiagConsoleLogger, DiagLogLevel } = require("@opentelemetry/api");

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ALL);

const http = require('http');
const { trace } = require('@opentelemetry/api');
const express = require('express');
const axios = require('axios');
const { startTracing } = require('@splunk/otel');

// Required when instrumenting manually. See docs here: https://github.com/signalfx/splunk-otel-js#manually-instrument-an-application
startTracing();

const PORT = process.env.PORT || 8080;
const app = express();
const tracer = trace.getTracer('splunk-otel-example-basic');

app.get('/hello', (req, res) => {
  const span = tracer.startSpan('hello');
  span.setAttribute('key', 'value');
  console.log(201, '/hello');
  res.status(201).send('Hello from node\n');
  span.end();
});

app.get('/', (req, res) => {
  axios.get(`http://localhost:${PORT}/hello`)
    .then((response) => {
      console.log(200, '/');
      res.status(200).send(`Hello from node: ${response.status}\n`);
    })
    .catch((err) => {
      console.log(500, '/', err);
      res.status(500).send(`Error from node: ${err.message}\n`);
    });
});

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
