const debug = require('debug')('pgClient')
const Pool = require('pg').Pool

/*
 * middleware pour la création et la libération des connexions postgresql
 */

async function open(req, res, next) {
    debug("open pg connection...")
    req.pgPool = new Pool({
        user: process.env.PGUSER,
        host: process.env.PGHOST,
        database: process.env.PGDATABASE,
        password: process.env.PGPASSWORD,
        port: process.env.PGPORT
    })
    //Debut de la transaction
    await req.pgPool.query('BEGIN')
    
    next()
}

async function close(req, res, next) {
    debug("close pg connection...")
    if (req.error){
        debug("rollback")
        await req.pgPool.query('ROLLBACK')
    }else{
        debug("commit")
        await req.pgPool.query('COMMIT')
    }
    req.pgPool.end()

    next()
}

module.exports = {
	open,
	close
}

