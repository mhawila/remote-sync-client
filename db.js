'use strict';

var mysql = require('mysql');
var config = require('./config');
var pool = mysql.createPool(config.mysql);

// Db values
var dbName = config.mysql.database || 'sync_log_db';
var tableName = 'client_sync_log';

function acquireConnection(consumerCb) {
  pool.getConnection(function(err, connection) {
    if(err) {
      console.error('Error acquiring connection from pool');
      throw err;
    }
    consumerCb(null,connection);
  });
}

function getLastSyncRecord(recordConsumerCb) {
  pool.getConnection(function(err, connection) {
    if(err) {
      console.error('Error acquiring connection from pool');
      throw err;
    }
    var query = 'select * from ' + tableName
                + ' where sequence_number = 30'; 
                // + '(select max(sequence_number) from ' + tableName + ')';
    
    console.log('Running query ' + query);            
    connection.query(query, function(err, results) {
      if(err) {
        console.error('An error occured while running query ' + query 
              + ', error message is ', err.message);
        throw err;
      }
      connection.release();
      if(results.length > 0) {
        recordConsumerCb(results[0]);
      } else {
        recordConsumerCb(null);
      }
    }); 
  });           
}

module.exports = {
  getLastSyncRecord: getLastSyncRecord
}