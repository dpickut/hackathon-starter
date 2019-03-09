/*
 * Token.js in /models
 *
 * @version   $id$ V1.0
 * @package     Hackathon Starter fork with Groups, email verification i18n, & encrypted user data
 * @subpackage  app
 * @author      Sealogix Corp Developer
 * @copyright Copyright (C) 019 Sealogix Corp. All rights reserved.
 * This Software is for Sealogix internal use only and
 * is not intended for sale, free sharing or any other re-distribution.
 * Viloaters will be prosecuted!!
 *
 */
var bcrypt = require("bcrypt-nodejs");
var crypto = require("crypto");
var config = require("../config/config");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var moment = require("moment");

moment().format("YYYY MM DD");

const tokenSchema = new mongoose.Schema({
  _userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
    index: true
  },
  token: { type: String, required: true, index: true },
  newHashEmail: { type: String, default: "" },
  newEncryptedEmail: { type: String, default: "" },
  createdAt: { type: Date, required: true, default: Date.now, expires: 500000 } // 42000
});

const Token = mongoose.model("Token", tokenSchema);

module.exports = Token;
