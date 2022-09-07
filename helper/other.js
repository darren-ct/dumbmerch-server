module.exports.sendErr = (message,res) => {
    res.status(400).send({
        status:"Error",
        message:message
    })
};