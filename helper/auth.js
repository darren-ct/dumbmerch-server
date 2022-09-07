

module.exports.emailChecker = (email) => {
    return (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))
     
};

module.exports.minimumChecker = (val,min) => {
    return val.length > (min-1)
};

