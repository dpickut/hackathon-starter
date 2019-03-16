/*
 * loadHeaderText.js in /utils
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

const i18n = require('i18n');


module.exports = function loadHeaderText(req, res, returnData) {

  var headerText = {
    ACCOUNT_MANAGEMENT: i18n.__('ACCOUNT_MANAGEMENT'),
    ARRANGE_FLOWERS: i18n.__('ARRANGE_FLOWERS'),
    CONTACT: i18n.__('CONTACT'),
    CREATE_FREE_ACCOUNT: i18n.__('CREATE_FREE_ACCOUNT'),
    FLOWER_IMAGES_ON_THIS_SITE_ARE_COPYRIGHTED_AND_FOR_USE_ONLY_IN_CREATING_FLOWER_ARRANGEMENTS_ON_THE_FLOWER_ARCHITECT_COM_WEB_SITE: i18n.__('FLOWER_IMAGES_ON_THIS_SITE_ARE_COPYRIGHTED_AND_FOR_USE_ONLY_IN_CREATING_FLOWER_ARRANGEMENTS_ON_THE_FLOWER_ARCHITECT_COM_WEB_SITE'),
    FLOWER_PUZZLE_GAME: i18n.__('FLOWER_PUZZLE_GAME'),
    FORUM: i18n.__('FORUM'),
    HOME: i18n.__('HOME'),
    HOME_PAGE: i18n.__('HOME_PAGE'),
    INFORMATION: i18n.__('INFORMATION'),
    LANGUAGE: i18n.__('LANGUAGE'),
    LANGUAGE_MANAGEMENT: i18n.__('LANGUAGE_MANAGEMENT'),
    LOGIN: i18n.__('LOGIN'),
    LOGOUT: i18n.__('LOGOUT'),
    MY_ACCOUNT: i18n.__('MY_ACCOUNT'),
    MY_GROUPS: i18n.__('MY_GROUPS'),
    MY_MEMBERSHIP: i18n.__('MY_MEMBERSHIP'),
    PRICING: i18n.__('PRICING'),
    SEALOGIX_CORP_ALL_RIGHTS_RESERVED_PATENT_PENDING_US: i18n.__('© 2017_SEALOGIX_CORP_ALL_RIGHTS_RESERVED_PATENT_PENDING_US_14212028'),
    SHOP: i18n.__('SHOP'),
    TRY_IT_AS_GUEST: i18n.__('TRY_IT_AS_GUEST'),
    UPGRADE_MEMBERSHIP: i18n.__('UPGRADE_MEMBERSHIP')

  };

  // add header translation data
  for (var key in headerText) {
    if (headerText.hasOwnProperty(key)) {
      returnData[key] = headerText[key];
    }
  }
  if (req.user) {
    returnData.USERNAME = encryptor.decrypt(req.user.profile.name) || encryptor.decrypt(req.user.username) || encryptor.decrypt(req.user.email);
  } else {
    returnData.USERNAME = i18n.__("GUEST");
  }

  return returnData;
};
