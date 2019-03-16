/*
 * User.js in /models
 *
 * @version   $id$ V1.0
 * @package     Hackathon Starter fork with Groups, email verification i18n, & encrypted user data
 * @subpackage  app
 * @author      Sealogix Corp Developer
 * @copyright Copyright (C) 2019 Sealogix Corp. All rights reserved.
 * This Software is for Sealogix internal use only and
 * is not intended for sale, free sharing or any other re-distribution.
 * Viloaters will be prosecuted!!
 *
 */
const bcrypt = require("bcrypt-nodejs");
const crypto = require("crypto");
const mongoose = require("mongoose");
// RMS
const Schema = mongoose.Schema;
const moment = require("moment");

const userSchema = new mongoose.Schema(
  {
    // RMS
    textname: { type: String, index: true }, // to be used to find  key users as text tag
    username: { type: String, unique: true, index: true }, // hashed
    encryptedUserName: { type: String }, // encrypted 2 way
    email: { type: String, unique: true, index: true }, // hashed
    encryptedEmail: { type: String }, // encrypted 2 way
    role: { type: String, default: "free" }, // free, club, admin, super
    isVerified: { type: Boolean, default: false }, // verification of email
    password: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    snapchat: String,
    facebook: String,
    twitter: String,
    google: String,
    github: String,
    instagram: String,
    linkedin: String,
    steam: String,
    tokens: Array,

    profile: {
      // RMS
      name: { type: String }, // encripted 2 way
      firstname: { type: String, default: "", index: true }, // hashed
      encryptedFirstname: { type: String, default: "", index: true }, // encrypted 2 way
      lastname: { type: String, default: "", index: true }, // hashed
      encryptedLastname: { type: String, default: "", index: true }, // encrypted 2 way
      gdpr: { type: Boolean, default: false }, // GDPR agreement.
      language: { type: String, default: "en" },

      // name: String,
      gender: String,
      location: String,
      website: String,
      picture: String
    },
    // RMS
    last: {
      // used to store previous states or actions for next load
      new: { type: Boolean, default: true } // if true then new member help video pops up on load.
    },
    // RMS
    member: {
      typ: { type: String, default: "free" }, // free, club
      // mtp: {type: String, default: 'free'},  // free, basicM, designerM, enterpriseM, basicY, designerY, enterpriseY, threeMonthGroup
      sub: { type: String, default: "free" }, // subscription type: free, basicM, designerM, enterpriseM, basicY, designerY, enterpriseY, threeMonthGroup
      lmr: { type: Date, default: moment().endOf("month") }, // date to update monthly items
      due: { type: Date, default: Date.now } // membership due date
    },
    // RM
    groups: [
      {
        gId: { type: Schema.ObjectId, ref: "Group" }, // a normal group or enterprise group. group ID
        tit: { type: String, default: "", trim: true }, // group title
        oNa: { type: String, default: "", trim: true } // Name of owner
      }
    ]
  },
  { timestamps: true }
);

/**
 * Password hash middleware.
 */
userSchema.pre("save", function save(next) {
  const user = this;
  if (!user.isModified("password")) {
    return next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});

/**
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword = function comparePassword(
  candidatePassword,
  cb
) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};

/**
 * Helper method for getting user's gravatar.
 */
userSchema.methods.gravatar = function gravatar(size) {
  if (!size) {
    size = 200;
  }
  if (!this.email) {
    return `https://gravatar.com/avatar/?s=${size}&d=retro`;
  }
  const md5 = crypto
    .createHash("md5")
    .update(this.email)
    .digest("hex");
  return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
