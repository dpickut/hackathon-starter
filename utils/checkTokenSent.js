/*
 * checkTokenSent.js in /utils
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

// Util taken from stackoverflow answer
// https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
module.exports = function checkTokenSent(req, res, user) {
    // Find a matching token
    Token.findOne({_userId: ObjectId(user._id)}, {}, { sort: { 'createdAt' : -1 } }, function (err, token) {
      if (err) {
        req.flash('errors', err);
      } else {
        if (!token || (moment().diff(moment(token.createdAt), 'days')) > 1) {  // resend daily if they try to login and not verified

          // Create a verification token for this user
          var newToken = new Token({
            _userId: user._id,
            token: crypto.randomBytes(16).toString('hex'),
            newHashEmail: user.email,
            newEncryptedEmail: user.encryptedEmail
          });

          // Save the verification token
          newToken.save(function (err) {
            if (err) {
              req.flash('errors', err);
            } else {
              var toRecipient = user.email;
              if(!user.legacyLogin) {
                toRecipient = encryptor.decrypt(user.encryptedEmail);
              }

              //send email verification
              var mailOptions = {
                to: toRecipient,
                from: process.env.SITE_EMAIL_FROM_ADDESS,
                subject: i18n.__('PLEASE_CONFIRM_YOUR_EMAIL_TO_COMPLETE_YOUR_REGISTATION_TO_' + process.env.BASE_URL),
                html: "<a target=_blank  href=" + process.env.BASE_URL + "/confirmation/" + newToken.token + "'> " + i18n.__('COMFIRM_YOUR_EMAIL') + "</a>"                                  // "<a target=_blank  href='https://flowerarchitect.com/confirmation?authToken\'" + i18n.__('COMFIRM_YOUR_EMAIL') + "add add token here</a>"
              };
              transporter.sendMail(mailOptions, function (err) {
                if (err) {
                  utils.errLog(req, res, 'users.postLogin.4', err, true);
                } else {
                  req.flash('errors', { msg: i18n.__('EMAIL_VERIFICATION_SENT_TO_YOUR_EMAIL_ADDRESS')});
                  res.redirect('/login');
                }
              });
            }
          });
        } else {
          req.flash('errors', {msg: i18n.__('YOUR_ACCOUNT_HAS_NOT_BEEN_VERIFIED')});
          res.redirect('/login');
        }
      }
    });
};
