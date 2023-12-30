'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db, callback) {
  db.createTable('product', {
    pid: { type: 'string', primaryKey: true },
    bid: 'string',
    name: 'string',
    description: 'string',
    price: 'int',
    count: 'int'
  }, callback);
};

exports.down = function (db, callback) {
  db.dropTable('product', callback);

};

exports._meta = {
  "version": 1
};
