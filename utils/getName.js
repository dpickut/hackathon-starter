
/*
 * getName.js in /utils
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

const encryptor = require('simple-encryptor')({key: process.env.SIMPLE_ENCRYPTOR_KEY});


module.exports = function getName(req, res, user) {
  var nam = '';
  if (user.profile.encryptedFirstname) {
    nam = encryptor.decrypt(user.profile.encryptedFirstname);
  }
  if (user.profile.encryptedLastname) {
    if (nam) {
      nam += ' ' + encryptor.decrypt(user.profile.encryptedLastname);
    } else {
      nam = encryptor.decrypt(user.profile.encryptedLastname);
    }
  }
  if (!nam) {
    nam = encryptor.decrypt(user.encryptedUserName);
  }
  return encryptor.encrypt(nam);
};
