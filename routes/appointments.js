var express = require('express');
var router = express.Router();

const APPOINTMENTS_MOCK = [
  {
    id: '1',
    name: 'Dummy 1',
    date: null,
    hour: null,
  },
  {
    id: '2',
    name: 'Dummy 2',
    date: null,
    hour: null,
  },
]

router.get('/', function(req, res, next) {
  res.json({
    results: APPOINTMENTS_MOCK,
    status: 'ok'
  });
});

module.exports = router;
