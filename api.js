const express = require('express');

const {
  create,
  readAll,
  readOne,
  update,
  del,
} = require('./notes');

const router = express.Router();

function getRequest(req, res) {
  const data = req.body;
  create(data).then((x => res.send(JSON.stringify(x))));
}

function lookup(req, res) {
  const { id } = req.params.id;
  readOne(id).then((x => res.send(JSON.stringify(x))));
}

function findall(req, res) {
  readAll().then(x => res.send(JSON.stringify(x)));
}

function remove(req, res) {
  const { id } = req.params.id;
  del(id).then(((x) => {
    if (x !== null) {
      res.send(x);
    } else {
      res.status(202);
      res.send();
    }
  }));
}

function alter(req, res) {
  const data = req.body;
  const { id } = req.params.id;
  update(id, data).then(x => res.send(JSON.stringify(x)));
}

/* todo útfæra api */
router.post('/', getRequest);
router.get('/:id', lookup);
router.get('/', findall);
router.delete('/:id', remove);
router.put('/:id', alter);


module.exports = router;
