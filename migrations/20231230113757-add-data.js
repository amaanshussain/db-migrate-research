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
  db.runSql("insert into user (uid, name, email, avatar, hash) values (?, ?, ?, ?, ?)", ["bb2c271a-3322-4261-9e74-d54f967940fc", "amaan hussain", "amaan6307@gmail.com", "", "eec712208454ad75e64e069eb460e13f666b103cdd7d5e24a5f81edfb8aa327a"], callback);
  db.runSql("insert into token (token, uid) values (?, ?)", ["157a2ddb3d1c60e3d019f92d559ddf434cdaf7da0527b78d9cc4c74e6e11a091", "bb2c271a-3322-4261-9e74-d54f967940fc"], callback);
};

exports.down = function (db, callback) {
  return null;
};

exports._meta = {
  "version": 1
};
