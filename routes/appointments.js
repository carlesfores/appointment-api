var express = require('express');
var router = express.Router();
var pool = require('../db');

function validateAppointment(body) {
  var name = typeof body.name === 'string' ? body.name.trim() : '';
  var date = body.date === undefined ? null : body.date;
  var hour = body.hour === undefined ? null : body.hour;

  if (!name) {
    return 'name is required and must be a non-empty string';
  }

  if (date !== null && (typeof date !== 'string' || !isValidDate(date))) {
    return 'date must be a valid date in YYYY-MM-DD format or null';
  }

  if (hour !== null && (typeof hour !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(hour))) {
    return 'hour must be a valid time in HH:mm or HH:mm:ss format or null';
  }

  return { name: name, date: date, hour: hour };
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  var parsed = new Date(value + 'T00:00:00Z');
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function getId(value) {
  if (!/^\d+$/.test(value)) {
    return null;
  }

  var id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function sendError(res, status, message) {
  res.status(status).json({ status: 'error', message: message });
}

router.get('/', async function(req, res, next) {
  try {
    var result = await pool.query('SELECT id, name, date, hour FROM appointments ORDER BY id');
    res.json({ results: result.rows, status: 'ok' });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async function(req, res, next) {
  var id = getId(req.params.id);
  if (!id) {
    return sendError(res, 400, 'id must be a positive integer');
  }

  try {
    var result = await pool.query(
      'SELECT id, name, date, hour FROM appointments WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return sendError(res, 404, 'Appointment not found');
    }

    res.json({ result: result.rows[0], status: 'ok' });
  } catch (error) {
    next(error);
  }
});

router.post('/', async function(req, res, next) {
  var appointment = validateAppointment(req.body || {});
  if (typeof appointment === 'string') {
    return sendError(res, 400, appointment);
  }

  try {
    var result = await pool.query(
      'INSERT INTO appointments (name, date, hour) VALUES ($1, $2, $3) RETURNING id, name, date, hour',
      [appointment.name, appointment.date, appointment.hour]
    );

    res.status(201).json({ result: result.rows[0], status: 'ok' });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async function(req, res, next) {
  var id = getId(req.params.id);
  if (!id) {
    return sendError(res, 400, 'id must be a positive integer');
  }

  var appointment = validateAppointment(req.body || {});
  if (typeof appointment === 'string') {
    return sendError(res, 400, appointment);
  }

  try {
    var result = await pool.query(
      'UPDATE appointments SET name = $1, date = $2, hour = $3 WHERE id = $4 RETURNING id, name, date, hour',
      [appointment.name, appointment.date, appointment.hour, id]
    );

    if (result.rowCount === 0) {
      return sendError(res, 404, 'Appointment not found');
    }

    res.json({ result: result.rows[0], status: 'ok' });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async function(req, res, next) {
  var id = getId(req.params.id);
  if (!id) {
    return sendError(res, 400, 'id must be a positive integer');
  }

  try {
    var result = await pool.query(
      'DELETE FROM appointments WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rowCount === 0) {
      return sendError(res, 404, 'Appointment not found');
    }

    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
