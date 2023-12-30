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
    db.createTable('token', {
        token: { type: 'string', primaryKey: true },
        uid: {
            type: 'string',
            foreignKey: {
                name: 'token_uid_user_uid_fk',
                table: 'user',
                rules: {
                    onDelete: 'CASCADE',
                },
                mapping: 'uid'
            }
        }
    }, callback);
};

exports.down = function (db, callback) {
    db.dropTable('token', callback);
};

exports._meta = {
    "version": 1
};
