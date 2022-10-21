const { Client } = require('pg')

const connectionString = process.env.DATABASE_URL
const db = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  })
db.connect()

const logger = async (req, res, next) => {
  console.log("Middleware hit")
  const { method, path, ip, ips } = req;
  const x_forwarded_for = req.headers["x-forwarded-for"];

  const logObject = {
    method,
    path,
    x_forwarded_for,
    ip,
    ips,
  }

  insertRawLogData(req);
  insertParsedData(logObject)

  next()
}

async function insertRawLogData(req){
  const toLog = {
    headers: JSON.stringify(req.headers),
    body: JSON.stringify(req.body)
  }

  const text = 'INSERT INTO raw_logs (headers, body) VALUES($1, $2)'
  const values = [toLog.headers, toLog.body]
  const response = await db.query(text, values)
}

async function insertParsedData(Obj){
  // Get path user ID
  const result = await db.query("SELECT * FROM student_paths WHERE path=$1", [Obj.path])
  const firstResult = result.rows[0]

  email = firstResult?.email || null

  const text = 'INSERT INTO parsed_logs(method, path, email, x_forwarded_for, ip, ips) VALUES($1, $2, $3, $4, $5, $6)'
  const values = [Obj.method, Obj.path, email, Obj.x_forwarded_for, Obj.ip, Obj.ips]
  const response = await db.query(text, values)
  // console.log(response)
}


module.exports = logger;
