/*
 * user.js in /controllers
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

const { promisify } = require('util');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const User = require('../models/User');
const toTitleCase = require('../utils/toTitleCase');
const checkTokenSent = require('../utils/checkTokenSent');
const loadHeaderText = require('../utils/loadHeaderText');
const loadTranslationsText = require('../utils/loadTranslationsText');
const getName = require('../utils/getName');
const Group = require('../models/Group');
const Token = require('../models/Token');
const encryptor = require('simple-encryptor')({ key: process.env.SIMPLE_ENCRYPTOR_KEY });
const i18n = require('i18n');
const randomBytesAsync = promisify(crypto.randomBytes);

const PUBLIC_KEY = process.env.GOOGLE_CAPTUA_PUBLIC_KEY; // Sealogix Captua credentials
const PRIVATE_KEY = process.env.GOOGLE_CAPTUA_PRIVATE_KEY;

/**
 * Validate string is email.
 */
var isEmailValid = (address) => {
  return /^[A-Z0-9'.1234z_%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(address);
};


/**
 * GET /login
 * Login page.
 */
exports.getLogin = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  var nocaptcha = '<script src=\'https://www.google.com/recaptcha/api.js\'></script>' +
    '	<div class="g-recaptcha" data-sitekey="' + PUBLIC_KEY + '"></div>';

  var returnData = {
    layout: false,
    title: 'Login',
    recaptcha_form: nocaptcha,
    PASSWORD: i18n.__('PASSWORD'),
    SIGN_IN: i18n.__('SIGN_IN'),
    ARE_YOU_A_HUMAN: i18n.__('ARE_YOU_A_HUMAN'),
    EMAIL_OR_USERNAME: i18n.__('EMAIL_OR_USERNAME'),
    LOGIN: i18n.__('LOGIN'),
    FORGOT_YOUR_PASSWORD: i18n.__('FORGOT_YOUR_PASSWORD'),
    SIGN_IN_WITH_FACEBOOK: i18n.__('SIGN_IN_WITH_FACEBOOK'),
    SIGN_IN_WITH_TWITTER: i18n.__('SIGN_IN_WITH_TWITTER'),
    SIGN_IN_WITH_GOOGLE: i18n.__('SIGN_IN_WITH_GOOGLE'),
    SIGN_IN_WITH_LINKED_IN: i18n.__('SIGN_IN_WITH_LINKED_IN'),
    SIGN_IN_WITH_INSTAGRAM: i18n.__('SIGN_IN_WITH_INSTAGRAM')
  };
  returnData = loadHeaderText(req, res, returnData);
  returnData = loadTranslationsText(req, res, returnData);

  res.render('account/login', returnData);
};


/**
 * POST /login
 * Sign in using email and password.
 */
exports.postLogin = (req, res, next) => {
  // req.assert('email', 'Email is not valid').isEmail();
  req.assert('email', i18n.__('EMAIL_USERNAME_CANNOT_BE_BLANK'))
    .notEmpty(); // email field can contain username or email
  req.assert('password', i18n.__('PASSWORD_CANNOT_BE_BLANK'))
    .notEmpty();
  req.sanitize('email')
    .normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/login');
  }

  var textUserIdentifier = req.body.email.toLowerCase(); // perform toLowerCase here prior to encryption could be username or email
  var hashedTextUserIdentifier = crypto.createHash('md5')
    .update(textUserIdentifier)
    .digest('hex'); // use to search for user

  var runPassport = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        req.flash('errors', info);
        return res.redirect('/login');
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        req.flash('success', { msg: i18n.__('SUCCESS_YOU_ARE_LOGGED_IN') });
        res.redirect(req.session.returnTo || '/');
      });
    })(req, res, next);
  };

  if (!isEmailValid(textEmail)) {
    User.findOne({ username: hashedTextUserIdentifier }, (err, user) => {  // if not an email then search for username and substitute email
      if (err) {
        if (err) {
          return next(err);
        }
      } else {
        if (user) { // verfy user email validated
          if (!user.isVerified) {
            checkTokenSent(req, res, user);
          } else {
            req.body.email = user.email;
            runPassport(req, res, next);
          }
        } else { // user not valid
          req.flash('errors', { msg: i18n.__('PLEASE_ENTER_VALID_EMAIL_OR_USERNAME') });
          return res.redirect('/login');
        }
      }
    });
  } else {
    User.findOne({ email: hashedTextUserIdentifier }, (err, user) => {  // verfy user email validated
      if (err) {
        if (err) {
          return next(err);
        }
      } else {
        if (user) {
          // Make sure the user has been verified
          if (!user.isVerified) {
            checkTokenSent(req, res, user);
          } else {
            req.body.email = user.email;
            runPassport(req, res, next);
          }
        } else {  // user not valid
          req.flash('errors', { msg: i18n.__('PLEASE_ENTER_VALID_EMAIL_OR_USERNAME') });
          return res.redirect('/login');
        }
      }
    });
  }
};

/**
 * GET /logout
 * Log out.
 */
exports.logout = (req, res) => {
  req.logout();
  req.session.destroy((err) => {
    if (err) console.log('Error : Failed to destroy the session during logout.', err);
    req.user = null;
    if (config.loginFrom == 'mobile') {
      res.send({ success: true });
    } else {
      res.redirect('/');
    }
  });
};


/**
 * GET /signup
 * Signup page.
 */
exports.getSignup = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  var nocaptcha = '<script src=\'https://www.google.com/recaptcha/api.js\'></script>' +
    '	<div class="g-recaptcha" data-sitekey="' + PUBLIC_KEY + '"></div>';

  var returnData = {
    title: 'Create Account',
    recaptcha_form: nocaptcha,
    SIGN_UP: i18n.__('SIGN_UP'),
    FIRSTNAME: i18n.__('FIRSTNAME'),
    LASTNAME: i18n.__('LASTNAME'),
    SIGNUPUSERNAME: i18n.__('SIGNUPUSERNAME'),
    EMAIL: i18n.__('EMAIL'),
    PASSWORD: i18n.__('PASSWORD'),
    CONFIRM_PASSWORD: i18n.__('CONFIRM_PASSWORD'),
    SIGNUP: i18n.__('SIGNUP'),
    ARE_YOU_A_HUMAN: i18n.__('ARE_YOU_A_HUMAN'),
    PRIVACY_STATEMENT: i18n.__('PRIVACY_STATEMENT'),
    REVIEW_POLICYS: i18n.__('REVIEW_POLICYS')
  };
  returnData = loadHeaderText(req, res, returnData);
  returnData = loadTranslationsText(req, res, returnData);
  res.render('account/signup', returnData);
};


/**
 * verifyRecaptcha function used to verify recaptcha in exports below
 */

var verifyRecaptcha = (key, callback) => {
  if (config.DATABASE === 'localhost') {
    var parseData = {};
    callback(parseData.success);
  } else {
    https.get('https://www.google.com/recaptcha/api/siteverify?secret=' + PRIVATE_KEY + '&response=' + key, (res) => {
      var data = '';
      res.on('data', (chunk) => {
        data += chunk.toString();
      });
      res.on('end', () => {
        try {
          var parsedData = JSON.parse(data);
          callback(parsedData.success);
        } catch (e) {
          callback(false);
        }
      });
    });
  }
};

/**
 * POST /confirmation
 */
exports.postConfirmation = (req, res, next) => {
  var authtoken = req.param('authtoken');
  // Find a matching token
  Token.findOne({ token: authtoken }, (err, token) => {
    if (err) {
      return res.status(400)
        .send({
          type: i18n.__('NOT_VERIFIED'),
          err
        });
    } else {
      if (!token) {
        return res.status(400)
          .send({
            type: i18n.__('NOT_VERIFIED'),
            msg: i18n.__('WE_WERE_UNABLE_TO_FIND_A_VALID_TOKEN_YOUR_TOKEN_MY_HAVE_EXPIRED')
          });
      } else {
        // If we found a token, find a matching user
        User.findOne({ _id: token._userId }, (err, user) => {
          if (!user) {
            return res.status(400)
              .send({ msg: i18n.__('WE_WERE_UNABLE_TO_FIND_A_USER_FOR_THIS_TOKEN') });
          }
          if (user.isVerified && !token.newHashEmail) {
            return res.status(400)
              .send({
                type: i18n.__('ALREADY_VERIFIED'),
                msg: i18n.__('THIS_USER_HAS_ALREADY_BEEN_VERIFIED')
              });
          } else {
            // Verify and save the user
            user.isVerified = true;
            if (token.newHashEmail) {
              user.email = token.newHashEmail;
              user.encryptedEmail = token.newEncryptedEmail;
            }
            user.save((err) => {
              if (err) {
                return res.status(400)
                  .send({
                    type: i18n.__('NOT_VERIFIED'),
                    err
                  });
              }
              res.status(200)
                .send(i18n.__('THE_ACCOUNT_HAS_BEEN_VERIFIED_PLEASE_LOG_IN'));
            });
          }
        });
      }
    }
  });
};

/**
 * POST /resend
 */
exports.resendTokenPost = (req, res, next) => {
  req.assert('email', 'Email is not valid')
    .isEmail();
  req.assert('email', 'Email cannot be blank')
    .notEmpty();
  req.sanitize('email')
    .normalizeEmail({ remove_dots: false });

  // Check for validation errors
  var errors = req.validationErrors();
  if (errors) {
    return res.status(400)
      .send({
        type: i18n.__('NOT_VERIFIED'),
        msg: err
      });
  } else {
    var hashedEmail = crypto.createHash('md5')
      .update(req.body.email.toLowerCase())
      .digest('hex');

    User.findOne({ email: hashedEmail }, (err, user) => {
      if (err) {
        return res.status(400)
          .send({
            type: i18n.__('NOT_VERIFIED'),
            msg: err
          });
      } else {
        if (!user) {
          return res.status(400)
            .send({ msg: 'We were unable to find a user with that email.' });
        }
        if (user.isVerified) {
          return res.status(400)
            .send({ msg: 'This account has already been verified. Please log in.' });
        }

        // Create a verification token, save it, and send email
        var token = new Token({
          _userId: user._id,
          token: crypto.randomBytes(16)
            .toString('hex'),
          newHashEmail: user.email,
          newEncryptedEmail: user.encryptedEmail
        });

        // Save the token
        token.save((err) => {
          if (err) {
            return res.status(400)
              .send({
                type: i18n.__('NOT_VERIFIED'),
                msg: err
              });
          } else {
            var mailOptions = {
              to: unEncryptedEmail,
              from: process.env.SITE_EMAIL_FROM_ADDESS,
              subject: i18n.__('PLEASE_CONFIRM_YOUR_EMAIL_TO_COMPLETE_YOUR_REGISTATION_TO_FLOWERARCHITECT_COM'),
              html: '<a target=_blank  href=\'' + process.env.BASE_URL + '/confirmation/' + token.token + '\'> ' + i18n.__('COMFIRM_YOUR_EMAIL') + '</a>'                                  // "<a target=_blank  href='https://flowerarchitect.com/confirmation?authToken\'" + i18n.__('COMFIRM_YOUR_EMAIL') + "add add token here</a>"
            };
            transporter.sendMail(mailOptions, (err) => {
              if (err) {
                return res.status(400)
                  .send({
                    type: i18n.__('NOT_VERIFIED'),
                    msg: err
                  });
              } else {
                res.render('account/login', { title: i18n.__('EMAIL_VERIFICATION_SENT_TO_YOUR_EMAIL_ADDRESS') });
              }
            });
          }
        });
      }
    });
  }
};


/**
 * POST /signup
 * Create a new local account.
 */
exports.postSignup = (req, res, next) => {
  verifyRecaptcha(req.body['g-recaptcha-response'], (success) => {
    if (success || process.env.DATABASE === 'localhost') {
      //res.end("Success!");
      req.assert('email', i18n.__('EMAIL_USERNAME_CANNOT_BE_BLANK'))
        .notEmpty();
      req.assert('password', i18n.__('PASSWORD_CANNOT_BE_BLANK'))
        .notEmpty();
      req.assert('firstname', i18n.__('FIRSTNAME_MUST_BE_AT_LEAST_2_CHARACTERS_LONG'))
        .len(2);
      req.assert('lastname', i18n.__('LASTNAME_MUST_BE_AT_LEAST_2_CHARACTERS_LONG'))
        .len(2);
      req.assert('email', i18n.__('EMAIL_IS_NOT_VALID'))
        .isEmail();
      req.assert('password', i18n.__('PASSWORD_MUST_BE_AT_LEAST_4_CHARACTERS_LONG'))
        .len(4);
      req.assert('confirmPassword', i18n.__('PASSWORDS_DO_NOT_MATCH'))
        .equals(req.body.password);
      req.sanitize('email')
        .normalizeEmail({ gmail_remove_dots: false });
      if (req.body.username) {
        req.assert('username', i18n.__('USERNAME_MUST_BE_AT_LEAST_6_CHARACTERS_LONG'))
          .len(6);
        req.sanitize('username')
          .normalizeEmail({ gmail_remove_dots: false });
        var hashedUsername = crypto.createHash('md5')
          .update(req.body.username.toLowerCase())
          .digest('hex');
        var encryptedUsername = encryptor.encrypt(req.body.username.toLowerCase());
      }


      var errors = req.validationErrors();
      if (errors) {
        req.flash('errors', errors);
        return res.redirect('/signup');
      }

      var hashedEmail = crypto.createHash('md5')
        .update(req.body.email.toLowerCase())
        .digest('hex');
      var unEncryptedEmail = req.body.email.toLowerCase();
      var encryptedEmail = encryptor.encrypt(unEncryptedEmail);
      var hashedFirstname = crypto.createHash('md5')
        .update(req.body.firstname.toLowerCase())
        .digest('hex');
      var encryptedFirstname = encryptor.encrypt(req.body.firstname);
      var hashedLastname = crypto.createHash('md5')
        .update(req.body.lastname.toLowerCase())
        .digest('hex');
      var encryptedLastname = encryptor.encrypt(req.body.lastname);


      var user = new User({
        email: hashedEmail,
        password: req.body.password,
        encryptedEmail: encryptedEmail,
        profile: {
          firstname: hashedFirstname,
          encryptedFirstname: encryptedFirstname,
          lastname: hashedLastname,
          encryptedLastname: encryptedLastname
        }
      });

      if (hashedUsername) { // if username provided add to new user account
        user.encryptedUserName = encryptedUsername;
        user.username = hashedUsername;
      }

      user.profile.name = getName(req, res, user); // create firstname lastname string for use in profile

      User.findOne({ $or: [{ email: user.email }, { username: user.username }] }, (err, existingUser) => {
        if (err) {
          if (err) {
            return next(err);
          }
        } else {
          if (existingUser) {
            if (existingUser.email == user.email) {
              var msg = i18n.__('ACCOUNT_WITH_THAT_EMAIL_ADDRESS_ALREADY_EXISTS');
            } else if (existingUser.username === user.username) {
              var msg = i18n.__('ACCOUNT_WITH_THAT_USERNAME_ADDRESS_ALREADY_EXISTS');
            } else {
              var msg = i18n.__('ACCOUNT_WITH_THAT_USERNAME_AND_EMAIL_ADDRESS_ALREADY_EXISTS');
            }
            req.flash('errors', { msg: msg });
            return res.redirect('/signup');
          } else {
            user.save((err) => {
              if (err) {
                return next(err);
              }
              req.logIn(user, (err) => {
                if (err) {
                  return next(err);
                }
                // Create a verification token for this user
                var token = new Token({
                  _userId: user._id,
                  token: crypto.randomBytes(16)
                    .toString('hex'),
                  newHashEmail: user.email,
                  newEncryptedEmail: user.encryptedEmail
                });
                // console.log('token');
                // console.log(token);

                // Save the verification token
                token.save((err, newToken) => {
                  if (err) {
                    if (err) {
                      return next(err);
                    }
                  } else {
                    //send email verification
                    var mailOptions = {
                      to: unEncryptedEmail,
                      from: process.env.SITE_EMAIL_FROM_ADDESS,
                      subject: i18n.__('PLEASE_CONFIRM_YOUR_EMAIL_TO_COMPLETE_YOUR_REGISTATION_TO_FLOWERARCHITECT_COM'),
                      html: '<a target=_blank  href=\'' + process.env.BASE_URL + '/confirmation/' + token.token + '\'> ' + i18n.__('COMFIRM_YOUR_EMAIL') + '</a>'                                  // "<a target=_blank  href='https://flowerarchitect.com/confirmation?authToken\'" + i18n.__('COMFIRM_YOUR_EMAIL') + "add add token here</a>"
                    };
                    transporter.sendMail(mailOptions, (err) => {
                      if (err) {
                        if (err) {
                          return next(err);
                        }
                      }
                    });
                  }
                });
                res.redirect('/');
              });
            });
          }
        }
      });

    } else {
      if (req.body.email) {
        defaultEmail = req.body.email;
      }
      req.flash('errors', i18n.__('CAPTCHA_FAILING'));
      return res.redirect('/signup');
    }
  });
};


/**
 * GET /account
 * Profile page.
 */
exports.getAccount = (req, res) => {
  var data = {
    email: encryptor.decrypt(req.user.encryptedEmail),
    name: encryptor.decrypt(req.user.profile.name),
    gender: encryptor.decrypt(req.user.profile.gender),
    location: encryptor.decrypt(req.user.profile.location),
    website: encryptor.decrypt(req.user.profile.website)
  };
  var returnData = {
    title: 'Account Management',
    PROFILE_INFORMATION: i18n.__('PROFILE_INFORMATION'),
    EMAIL: i18n.__('EMAIL'),
    NAME: i18n.__('NAME'),
    GENDER: i18n.__('GENDER'),
    MALE: i18n.__('MALE'),
    FEMALE: i18n.__('FEMALE'),
    OTHER: i18n.__('OTHER'),
    LOCATION: i18n.__('LOCATION'),
    WEBSITE: i18n.__('WEBSITE'),
    GRAVATAR: i18n.__('GRAVATAR'),
    UPDATE_PROFILE: i18n.__('UPDATE_PROFILE'),
    CHANGE_PASSWORD: i18n.__('CHANGE_PASSWORD'),
    NEW_PASSWORD: i18n.__('NEW_PASSWORD'),
    CONFIRM_PASSWORD: i18n.__('CONFIRM_PASSWORD'),
    CHANGE_PASSWORD: i18n.__('CHANGE_PASSWORD'),
    DELETE_ACCOUNT: i18n.__('DELETE_ACCOUNT'),
    YOU_CAN_DELETE_YOUR_ACCOUNT_BUT_KEEP_IN_MIND_THIS_ACTION_IS_IRREVERSIBLE: i18n.__('YOU_CAN_DELETE_YOUR_ACCOUNT_BUT_KEEP_IN_MIND_THIS_ACTION_IS_IRREVERSIBLE'),
    DELETE_MY_ACCOUNT: i18n.__('DELETE_MY_ACCOUNT'),
    UNLINK_YOUR_INSTAGRAM_ACCOUNT: i18n.__('UNLINK_YOUR_INSTAGRAM_ACCOUNT'),
    LINK_YOUR_INSTAGRAM_ACCOUNT: i18n.__('LINK_YOUR_INSTAGRAM_ACCOUNT'),
    UNLINK_YOUR_GOOGLE_ACCOUNT: i18n.__('UNLINK_YOUR_GOOGLE_ACCOUNT'),
    LINK_YOUR_GOOGLE_ACCOUNT: i18n.__('LINK_YOUR_GOOGLE_ACCOUNT'),
    UNLINK_YOUR_FACEBOOK_ACCOUNT: i18n.__('UNLINK_YOUR_FACEBOOK_ACCOUNT'),
    LINK_YOUR_FACEBOOK_ACCOUNT: i18n.__('LINK_YOUR_FACEBOOK_ACCOUNT'),
    UNLINK_YOUR_TWITTER_ACCOUNT: i18n.__('UNLINK_YOUR_TWITTER_ACCOUNT'),
    LINK_YOUR_TWITTER_ACCOUNT: i18n.__('LINK_YOUR_TWITTER_ACCOUNT'),
    UNLINK_YOUR_LINKED_IN_ACCOUNT: i18n.__('UNLINK_YOUR_LINKED_IN_ACCOUNT'),
    LINK_YOUR_LINKED_IN_ACCOUNT: i18n.__('LINK_YOUR_LINKED_IN_ACCOUNT'),
    NAME: i18n.__('NAME'),
    GDPR_STATEMENT: i18n.__('GDPR_STATEMENT'),
    data

  };
  returnData = loadHeaderText(req, res, returnData);
  returnData = loadTranslationsText(req, res, returnData);
  res.render('account/profile', returnData);

};


/**
 * POST /account/profile
 * Update profile information.
 */
exports.postUpdateProfile = (req, res, next) => {
  req.assert('email', i18n.__('PLEASE_ENTER_A_VALID_EMAIL_ADDRESS'))
    .isEmail();
  req.sanitize('email')
    .normalizeEmail({ gmail_remove_dots: false });

  if (req.body.username) {
    req.assert('username', i18n.__('USERNAME_MUST_BE_AT_LEAST_6_CHARACTERS_LONG'))
      .len(6);
  }

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/account');
  }

  User.findById(req.user.id, (err, user) => {
    if (err) {
      return next(err);
    }
    if (req.body.username) {
      user.username = crypto.createHash('md5')
        .update(req.body.username.toLowerCase())
        .digest('hex');
      user.encryptedUsername = encryptor.encrypt(req.body.username.toLowerCase());
    } else {
      user.username = '';
    }
    user.profile.name = encryptor.encrypt(req.body.name) || '';
    user.profile.gender = encryptor.encrypt(req.body.gender) || '';
    user.profile.location = encryptor.encrypt(req.body.location) || '';
    user.profile.website = encryptor.encrypt(req.body.website) || '';
    user.profile.gdpr = req.body.gdpr || false;

    // check email and if does not match send token and if token clicked update email
    var hashedEmail = crypto.createHash('md5')
      .update(req.body.email.toLowerCase())
      .digest('hex');
    var encrypted = encryptor.encrypt(req.body.email.toLowerCase());

    if (user.email != hashedEmail) {
      // Create a verification token for this users email
      User.findOne({ email: hashedEmail }, (err, existingUser) => {
        if (err) {
          return next(err);
        }
        if (!existingUser) {
          var token = new Token({
            _userId: user._id,
            token: crypto.randomBytes(16)
              .toString('hex'),
            newHashEmail: hashedEmail,
            newEncryptedEmail: encrypted
          });
          // Save the verification token
          token.save((err) => {
            if (err) {
              return next(err);
            }
            //send email verification
            var mailOptions = {
              to: unEncryptedEmail,
              from: 'flowerarchitect@gmail.com',
              subject: i18n.__('PLEASE_CONFIRM_YOUR_EMAIL_TO_COMPLETE_YOUR_REGISTATION_TO_FLOWERARCHITECT_COM'),
              html: '<a target=_blank href=\"' + authenticationURL + '\"' + i18n.__('COMFIRM_YOUR_EMAIL') + '</a>'
            };
            transporter.sendMail(mailOptions, (err) => {
              if (err) {
                return next(err);
              }
              user.save((err) => {
                if (err) {
                  return next(err);
                }
                req.flash('success', { msg: i18n.__('PROFILE_INFORMATION_HAS_BEEN_UPDATED') });
                res.render('account/login', { title: i18n.__('EMAIL_VERIFICATION_SENT_TO_YOUR_EMAIL_ADDRESS') });
              });
            });
          });
        } else {
          user.save((err) => {
            if (err) {
              if (err) {
                return next(err);
              }
            }
            req.flash('success', { msg: i18n.__('PROFILE_INFORMATION_HAS_BEEN_UPDATED') });
            res.redirect('/account');
          });
        }
      });
    }
  });
};

/**
 * POST /account/password
 * Update current password.
 */
exports.postUpdatePassword = (req, res, next) => {
  req.assert('password', i18n.__('PASSWORD_MUST_BE_AT_LEAST_4_CHARACTERS_LONG'))
    .len(4);
  req.assert('confirmPassword', i18n.__('PASSWORDS_DO_NOT_MATCH'))
    .equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/account');
  }

  User.findById(req.user.id, (err, user) => {
    if (err) {
      return next(err);
    }
    user.password = req.body.password;
    user.save((err) => {
      if (err) {
        return next(err);
      }

      req.flash('success', { msg: i18n.__('PASSWORD_HAS_BEEN_CHANGED') });
      res.redirect('/account');
    });
  });
};


/**
 * POST /group/delete/userId
 * Delete user account by ID from all groups.
 */

var removeUserFromGroups = (res, req, userId) => {
  Group.update({}, { $pull: { mem: { mId: userId } } }, (err) => {
    if (err) {
      return next(err);
    }
  });
};


/**
 * POST /account/delete
 * Delete user account.
 */
exports.postDeleteAccount = (req, res, next) => {
  User.findById(req.user.id, (err, user) => {
    if (err) {
      return next(err);
    }
    removeUserFromGroups(res, req, req.user.id);
    User.deleteOne({ _id: req.user.id }, (err) => {
      if (err) {
        return next(err);
      }
      req.logout();
      req.flash('info', { msg: i18n.__('YOUR_ACCOUNT_HAS_BEEN_DELETED') });
      res.redirect('/');
    });
  });
};

/**
 * GET /account/unlink/:provider
 * Unlink OAuth provider.
 */
exports.getOauthUnlink = (req, res, next) => {
  const { provider } = req.params;
  User.findById(req.user.id, (err, user) => {
    if (err) {
      return next(err);
    }
    const lowerCaseProvider = provider.toLowerCase();
    const titleCaseProvider = toTitleCase(provider);
    user[lowerCaseProvider] = undefined;
    const tokensWithoutProviderToUnlink = user.tokens.filter(token =>
      token.kind !== lowerCaseProvider);
    // Some auth providers do not provide an email address in the user profile.
    // As a result, we need to verify that unlinking the provider is safe by ensuring
    // that another login method exists.
    if (
      !(user.email && user.password)
      && tokensWithoutProviderToUnlink.length === 0
    ) {
      req.flash('errors', {
        msg: i18n.__('THE') + ` ${titleCaseProvider} ` + i18n.__('ACCOUNT_CANNOT_BE_UNLINKED_WITHOUT_ANOTHER_FORM_OF_LOGIN_ENABLED')
          + i18n.__('PLEASE_LINK_ANOTHER_ACCOUNT_OR_ADD_AN_EMAIL_ADDRESS_AND_PASSWORD')
      });
      return res.redirect('/account');
    }
    user.tokens = tokensWithoutProviderToUnlink;
    user.save((err) => {
      if (err) {
        return next(err);
      }
      req.flash('info', { msg: `${titleCaseProvider} ` + i18n.__('ACCOUNT_HAS_BEEN_UNLINKED') });
      res.redirect('/account');
    });
  });
};


/**
 * GET /reset/:token
 * Reset Password page.
 */
exports.getReset = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  User
    .findOne({ resetPasswordToken: req.params.token })
    .where('resetPasswordExpires')
    .gt(Date.now())
    .exec((err, user) => {
      var nocaptcha = '<script src=\'https://www.google.com/recaptcha/api.js\'></script>' +
        '	<div class="g-recaptcha" data-sitekey="' + PUBLIC_KEY + '"></div>';

      if (!user) {
        req.flash('errors', { msg: i18n.__('PASSWORD_RESET_TOKEN_IS_INVALID_OR_HAS_EXPIRED') });
        return res.redirect('/forgot');
      }

      var returnData = {
        title: 'Password Reset',
        recaptcha_form: nocaptcha,
        RESET_PASSWORD: i18n.__('RESET_PASSWORD'),
        NEW_PASSWORD: i18n.__('NEW_PASSWORD'),
        CONFIRM_PASSWORD: i18n.__('CONFIRM_PASSWORD'),
        ARE_YOU_A_HUMAN: i18n.__('ARE_YOU_A_HUMAN'),
        CHANGE_PASSWORD: i18n.__('CHANGE_PASSWORD')
      };
      returnData = loadHeaderText(req, res, returnData);
      returnData = loadTranslationsText(req, res, returnData);
      res.render('account/reset', returnData);
    });
};

/**
 * POST /reset/:token
 * Process the reset password request.
 */
exports.postReset = (req, res, next) => {
  req.assert('password', i18n.__('PASSWORD_MUST_BE_AT_LEAST_4_CHARACTERS_LONG'))
    .len(4);
  req.assert('confirm', i18n.__('PASSWORDS_MUST_MATCH'))
    .equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('back');
  }

  const resetPassword = () =>
    User
      .findOne({ passwordResetToken: req.params.token })
      .where('passwordResetExpires')
      .gt(Date.now())
      .then((user) => {
        if (!user) {
          req.flash('errors', { msg: i18n.__('PASSWORD_RESET_TOKEN_IS_INVALID_OR_HAS_EXPIRED') });
          return res.redirect('back');
        }
        user.password = req.body.password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        return user.save()
          .then(() => new Promise((resolve, reject) => {
            req.logIn(user, (err) => {
              if (err) {
                return reject(err);
              }
              resolve(user);
            });
          }));
      });

  const sendResetPasswordEmail = (user) => {
    if (!user) {
      return;
    }
    let transporter = nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: process.env.SENDGRID_USER,
        pass: process.env.SENDGRID_PASSWORD
      }
    });
    const mailOptions = {
      to: user.email,
      from: process.env.SITE_EMAIL_FROM_ADDESS,
      subject: i18n.__('YOUR') + ' ' + process.env.BASE_URL + ' ' + i18n.__('PASSWORD_HAS_BEEN_CHANGED'),
      text: i18n.__('HELLO') + ',\n\n' + i18n.__('YOUR') + ' ' + process.env.BASE_URL + ' ' + i18n.__('PASSWORD_HAS_BEEN_CHANGED') + '.\\n'
    };
    return transporter.sendMail(mailOptions)
      .then(() => {
        req.flash('success', { msg: i18n.__('THIS_IS_A_CONFIRMATION_THAT_THE_PASSWORD_FOR_YOUR_ACCOUNT') });
      })
      .catch((err) => {
        if (err.message === 'self signed certificate in certificate chain') {
          console.log('WARNING: Self signed certificate in certificate chain. Retrying with the self signed certificate. Use a valid certificate if in production.');
          transporter = nodemailer.createTransport({
            service: 'SendGrid',
            auth: {
              user: process.env.SENDGRID_USER,
              pass: process.env.SENDGRID_PASSWORD
            },
            tls: {
              rejectUnauthorized: false
            }
          });
          return transporter.sendMail(mailOptions)
            .then(() => {
              req.flash('success', { msg: i18n.__('THIS_IS_A_CONFIRMATION_THAT_THE_PASSWORD_FOR_YOUR_ACCOUNT') });
            });
        }
        console.log('ERROR: Could not send password reset confirmation email after security downgrade.\n', err);
        req.flash('warning', { msg: i18n.__('THIS_IS_A_CONFIRMATION_THAT_THE_PASSWORD_FOR_YOUR_ACCOUNT') });
        return err;
      });
  };
  verifyRecaptcha(req.body['g-recaptcha-response'], (success) => {
    if (success) {
      resetPassword()
        .then(sendResetPasswordEmail)
        .then(() => {
          if (!res.finished) res.redirect('/');
        })
        .catch(err => next(err));
    }
  });
};


/**
 * GET /forgot
 * Forgot Password page.
 */
exports.getForgot = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }

  var nocaptcha = '<script src=\'https://www.google.com/recaptcha/api.js\'></script>' +
    '	<div class="g-recaptcha" data-sitekey="' + PUBLIC_KEY + '"></div>';

  var returnData = {
    title: 'Forgot Password',
    recaptcha_form: nocaptcha,
    FORGOT_PASSWORD: i18n.__('FORGOT_PASSWORD'),
    ENTER_YOUR_EMAIL_ADDRESS_BELOW_AND_WE_WILL_SEND_YOU_PASSWORD_RESET_INSTRUCTIONS: i18n.__('ENTER_YOUR_EMAIL_ADDRESS_BELOW_AND_WE_WILL_SEND_YOU_PASSWORD_RESET_INSTRUCTIONS'),
    EMAIL: i18n.__('EMAIL'),
    ARE_YOU_A_HUMAN: i18n.__('ARE_YOU_A_HUMAN'),
    RESET_PASSWORD: i18n.__('RESET_PASSWORD')
  };
  returnData = loadHeaderText(req, res, returnData);
  returnData = loadTranslationsText(req, res, returnData);
  res.render('account/forgot', returnData);
};


/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
exports.postForgot = (req, res, next) => {
  req.assert('email', 'Please enter a valid email address.')
    .isEmail();
  req.sanitize('email')
    .normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/forgot');
  }

  const createRandomToken = randomBytesAsync(16)
    .then(buf => buf.toString('hex'));

  const setRandomToken = token =>
    User
      .findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash('errors', { msg: i18n.__('NO_ACCOUNT_WITH_THAT_EMAIL_ADDRESS_EXISTS') });
        } else {
          user.passwordResetToken = token;
          user.passwordResetExpires = Date.now() + 3600000; // 1 hour
          user = user.save();
        }
        return user;
      });

  const sendForgotPasswordEmail = (user) => {
    if (!user) {
      return;
    }
    const token = user.passwordResetToken;
    let transporter = nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: process.env.SENDGRID_USER,
        pass: process.env.SENDGRID_PASSWORD
      }
    });
    const mailOptions = {
      to: user.email,
      from: process.env.SITE_EMAIL_FROM_ADDESS,
      subject: i18n.__('RESET_YOUR_PASSWORD_ON') + ` ` + process.env.BASE_URL,
      text: i18n.__('YOU_ARE_RECEIVING_THIS_EMAIL_BECAUSE_YOU_OR_SOMEONE_ELSE_HAVE_REQUESTED_THE_RESET_OF_THE_PASSWORD_FOR_YOUR_ACCOUNT') + `\n\n`
        + i18n.__('PLEASE_CLICK_ON_THE_FOLLOWING_LINK_OR_PASTE_THIS_INTO_YOUR_BROWSER_TO_COMPLETE_THE_PROCESS')
        + `\n\n http://${req.headers.host}/reset/${token}\n\n`
        + i18n.__('IF_YOU_DID_NOT_REQUEST_THIS_PLEASE_IGNORE_THIS_EMAIL_AND_YOUR_PASSWORD_WILL_REMAIN_UNCHANGED') + `\n`
    };
    return transporter.sendMail(mailOptions)
      .then(() => {
        req.flash('info', { msg: i18n.__('AN_E_MAIL_HAS_BEEN_SENT_TO') + user.email + i18n.__('WITH_FURTHER_INSTRUCTIONS') });
      })
      .catch((err) => {
        if (err.message === 'self signed certificate in certificate chain') {
          console.log('WARNING: Self signed certificate in certificate chain. Retrying with the self signed certificate. Use a valid certificate if in production.');
          transporter = nodemailer.createTransport({
            service: 'SendGrid',
            auth: {
              user: process.env.SENDGRID_USER,
              pass: process.env.SENDGRID_PASSWORD
            },
            tls: {
              rejectUnauthorized: false
            }
          });
          return transporter.sendMail(mailOptions)
            .then(() => {
              req.flash('info', { msg: i18n.__('AN_E_MAIL_HAS_BEEN_SENT_TO') + user.email + i18n.__('WITH_FURTHER_INSTRUCTIONS') });
            });
        }
        console.log('ERROR: Could not send forgot password email after security downgrade.\n', err);
        req.flash('errors', { msg: i18n.__('ERROR_SENDING_THE_PASSWORD_RESET_MESSAGE_PLEASE_TRY_AGAIN_SHORTLY') });
        return err;
      });
  };


  verifyRecaptcha(req.body['g-recaptcha-response'], (success) => {
    if (success) {
      createRandomToken
        .then(setRandomToken)
        .then(sendForgotPasswordEmail)
        .then(() => res.redirect('/forgot'))
        .catch(next);
    }
  });
};



