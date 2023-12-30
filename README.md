# db-migrate

Use db-migrate to manage databases across platforms through migration files.

## Initialize Directory

If not installed yet, install now:
```
npm i -g db-migrate
```

Now that it is installed, we can use different arguments to design our db-migrate argument:
- --config - Set location of database config file, this defaults to ./database.json
- -e - Set the environment that will be used in the config file. (dev, test, prod)

For reference, we will be using the dev environment for setup. Create a config file called database.json in your root directory and use the following data:
```
{
    "dev": {
        "driver": "mysql",
        "user": "root",
        "password": "",
    }
}
```


Create a database for your project using the db command:
```
db-migrate db:create databaseName
```

You can also use :drop to drop a database.

The above command will create databaseName, you can use this in your configuration.

```
{
    "dev": {
        "driver": "mysql",
        "user": "root",
        "password": "",
        "database": "databaseName"
    }
}
```

If you are using dotenv in your project, you can use environment variables to set the data instead of putting the secret in the config file:
```
{
    "dev": {
        "driver": "mysql",
        "user": {"ENV": "DBUSER"},
        "password": {"ENV": "DBPASSWORD"},
        "database": {"ENV": "DBDATABASE"}
    }
}
```

## Create Migration

Use create command to create a migration:
```
db-migrate create migrationName
```

This will create a file at ./migrations/ where you can programmatically design your database.

When creating a migration, you will open a file that has two functions, up and down where we set our change. In up, we will add the creation and down will be the drop. 
```
exports.up = function (db, callback) {
    db.createTable('user', {
        uid: { type: 'string', primaryKey: true },
        name: { 'string' },
    }, callback);
};

exports.down = function (db, callback) {
    db.dropTable('user', callback);
};
```

The attribute is the column name and the data is the configuration of the column, you can set its properties. There are many options that this object can support:

- type - the column data type. Supported types can be found below
- length - the column data length, where supported
- primaryKey - true to set the column as a primary key. Compound primary keys are supported by setting the primaryKey option to true on multiple columns
- autoIncrement - true to mark the column as auto incrementing
- notNull - true to mark the column as non-nullable, omit it archive database default behavior and false to mark explicitly as nullable
- unique - true to add unique constraint to the column
- defaultValue - set the column default value. To set an expression (eg a function call) as the default value use this syntax: defaultValue: new String('uuid_generate_v4()')
- foreignKey - set a foreign key to the column

Different data types that can be set to a column below:
```
{
  CHAR: 'char',
  STRING: 'string',
  TEXT: 'text',
  SMALLINT: 'smallint',
  BIGINT: 'bigint',
  INTEGER: 'int',
  SMALL_INTEGER: 'smallint',
  BIG_INTEGER: 'bigint',
  REAL: 'real',
  DATE: 'date',
  DATE_TIME: 'datetime',
  TIME: 'time',
  BLOB: 'blob',
  TIMESTAMP: 'timestamp',
  BINARY: 'binary',
  BOOLEAN: 'boolean',
  DECIMAL: 'decimal'
};
```

A foreign key uses a specific object that is shown below:
```
foreignKey: {
    name: 'token_uid_user_uid_fk',
    table: 'user',
    mapping: 'uid',
    rules: {
        onDelete: 'CASCADE',
        onUpdate: 'RESTRICT'
    }
}
```

## Upload Changes

Now that the migrations are set, you can push the changes using the up command:
```
db-migrate up
```

Each migration runs in succession and you can set the number of migrations to run with your command:
```
db-migrate up -c 5 // 5 migrations
```
