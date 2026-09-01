const bcrypt = require("bcryptjs");

const hashPassword = async (password) => {
    return await bcrypt.hash(password, 12);
};

module.exports = hashPassword;