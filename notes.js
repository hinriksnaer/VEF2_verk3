const { Client } = require('pg');
const xss = require('xss');
const validator = require('validator');

const connectionString = process.env.DATABASE_URL;

function validate(title, text, datetime) {
  const returnList = [];

  if (!typeof title === 'string' || !validator.isLength(title, { min: 1, max: 255 })) {
    returnList.push({
      field: 'title',
      message: 'Title must be a string of length 1 to 255 character',
    });
  }
  if (typeof text !== 'string') {
    returnList.push({
      field: 'text',
      message: 'Text must be a string',
    });
  }

  if (!validator.toDate(datetime)) {
    returnList.push({
      field: 'datetime',
      message: 'Datetime must be ISO 8601 date',
    });
  }
  return returnList;
}

/**
 * Create a note asynchronously.
 *
 * @param {Object} note - Note to create
 * @param {string} note.title - Title of note
 * @param {string} note.text - Text of note
 * @param {string} note.datetime - Datetime of note
 *
 * @returns {Promise} Promise representing the object result of creating the note
 */
async function create({ title, text, datetime } = {}) {
  const data = [xss(datetime), xss(title), xss(text)];

  const returnObject = validate(title, text, datetime);

  if (returnObject.length <= 0) {
    const client = new Client({ connectionString });
    await client.connect();
    const resolve = await client.query('INSERT INTO public.notes(datetime, title, text) VALUES ($1, $2, $3) RETURNING *', data);
    return {
      id: resolve.rows[0].id,
      title: resolve.rows[0].title,
      text: resolve.rows[0].text,
      datetime: resolve.rows[0].datetime,
    };
  }
  return returnObject;
}

/**
 * Read all notes.
 *
 * @returns {Promise} Promise representing an array of all note objects
 */
async function readAll() {
  const returnList = [];
  const client = new Client({ connectionString });
  await client.connect();
  const resolve = await client.query('SELECT * FROM notes;');
  for (let i = 0; i < resolve.rows.length; i++) { // eslint-disable-line
    returnList.push({
      id: resolve.rows[i].id,
      title: resolve.rows[i].title,
      text: resolve.rows[i].text,
      datetime: resolve.rows[i].datetime,
    });
  }
  return returnList;
}

/**
 * Read a single note.
 *
 * @param {number} id - Id of note
 *
 * @returns {Promise} Promise representing the note object or null if not found
 */
async function readOne(id) {
  const client = new Client({ connectionString });
  await client.connect();
  try {
    const resolve = await client.query('SELECT * FROM notes where id = $1', [id]);
    return {
      id: resolve.rows[0].id,
      title: resolve.rows[0].title,
      text: resolve.rows[0].text,
      datetime: resolve.rows[0].datetime,
    };
  } catch (err) {
    return {
      error: 'Note not found',
    };
  }
}

/**
 * Update a note asynchronously.
 *
 * @param {number} id - Id of note to update
 * @param {Object} note - Note to create
 * @param {string} note.title - Title of note
 * @param {string} note.text - Text of note
 * @param {string} note.datetime - Datetime of note
 *
 * @returns {Promise} Promise representing the object result of creating the note
 */
async function update(id, { title, text, datetime } = {}) {
  const data = [xss(datetime), xss(title), xss(text)];
  const returnObject = validate(title, text, datetime);
  if (returnObject.length <= 0) {
    try {
      const client = new Client({ connectionString });
      await client.connect();
      const resolve = await client.query('UPDATE notes SET datetime = $2, title = $3, text = $4 WHERE id = $1 RETURNING *;', [id, data[0], data[1], data[2]]);
      return {
        id: resolve.rows[0].id,
        title: resolve.rows[0].title,
        text: resolve.rows[0].text,
        datetime: resolve.rows[0].datetime,
      };
    } catch (err) {
      return {
        error: 'Note not found',
      };
    }
  } else {
    return returnObject;
  }
}

/**
 * Delete a note asynchronously.
 *
 * @param {number} id - Id of note to delete
 *
 * @returns {Promise} Promise representing the boolean result of creating the note
 */
async function del(id) {
  const client = new Client({ connectionString });
  await client.connect();
  const result = await client.query('DELETE FROM notes WHERE id = $1', [id]);
  if (result.rowCount !== 1) {
    return {
      error: 'Note not found',
    };
  }
  return null;
}

module.exports = {
  create,
  readAll,
  readOne,
  update,
  del,
};
