/*
 * loadTranslationsText.js in /utils
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

module.exports = function loadTranslationsText(req, res, returnData) {
  translations = {
    LANGUAGE_MANAGEMENT: i18n.__('LANGUAGE_MANAGEMENT'),
    LANGUAGE: i18n.__('LANGUAGE'),
    CHINESE: i18n.__('CHINESE'),
    DANISH: i18n.__('DANISH'),
    DUTCH: i18n.__('DUTCH'),
    ENGLISH: i18n.__('ENGLISH'),
    FARSI_PERSIAN: i18n.__('FARSI_PERSIAN'),
    FINNISH: i18n.__('FINNISH'),
    FRENCH: i18n.__('FRENCH'),
    GERMAN: i18n.__('GERMAN'),
    ITALIAN: i18n.__('ITALIAN'),
    JAPANESE: i18n.__('JAPANESE'),
    KOREAN: i18n.__('KOREAN'),
    LANGUAGE: i18n.__('LANGUAGE'),
    POLISH: i18n.__('POLISH'),
    RUSSIAN: i18n.__('RUSSIAN'),
    SPANISH: i18n.__('SPANISH'),
    VIETNAMESE: i18n.__('VIETNAMESE')
  };
  // add header translation data
  for (var key in translations) {
    if (translations.hasOwnProperty(key)) {
      returnData[key] = translations[key];
    }
  }
  return returnData;
};
