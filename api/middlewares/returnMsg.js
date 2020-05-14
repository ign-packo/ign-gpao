module.exports = function (req, res, next) {
    if (req.error){
        res.status(req.error.code).json(req.error)
    }else{
        res.status(200).json(req.result)
    }
    next()
}