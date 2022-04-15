const mysql = require("yn-mysql-utils");

class MSql {

  constructor() {
    this.db = new mysql({
      host     : '127.0.0.1',
      user     : 'root',
      password : 'lb714500',
      database : 'ScanCodeLogin',
      connectionLimit : 10
    });
  }

  async query (params) {
    return await this.db.Query({ sql: params.sql, par: params.data })
  }

}

module.exports = new MSql();