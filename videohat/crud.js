//crud.js

const express = require('express');

module.exports = (Collection) => {

  // ======
  // Create
  // ======
  const create = (req, res, next) => {
    const newEntry = req.body;
    Collection.create(newEntry, (e,newEntry) => {
      if(e) {
        console.log(e);
        res.sendStatus(500);
      } else {
        res.send(newEntry);
        next();
      }
    });
  };
  
  // =========
  // Read many
  // =========
  const readMany = (req, res, next) => {
    let query = res.locals.query || {};
  
    Collection.find(query, (e,result) => {
      if(e) {
        res.status(500).send(e);
        console.log(e.message);
      } else {
        res.send(result);
        next();
      }
    });
  };

  // ========
  // Read one
  // ========
  const readOne = (req, res, next) => {
    const { _id } = req.params;
  
    Collection.findById(_id, (e,result) => {
      if(e) {
        res.status(500).send(e);
        console.log(e.message);
      } else {
        res.send(result);
        next();
      }
    });
  };
  
  // ======
  // Update
  // ======
  const update = (req, res, next) => {
    const changedEntry = req.body;
    Collection.update({ _id: req.params._id }, { $set: changedEntry }, (e) => {
      if (e)
        res.sendStatus(500);
      else
        res.sendStatus(200);
        next();
    });
  };
  
  // ======
  // Remove
  // ======
  const remove = (req, res, next) => {
    Collection.remove({ _id: req.params._id }, (e) => {
      if (e)
      res.status(500).send(e);
      else
        res.sendStatus(200);
        next();
    });
  };

  // ======
  // Routes
  // ======

  return {
    create: create,
    readMany: readMany,
    readOne: readOne,
    update: update,
    remove: remove
    
  }
}