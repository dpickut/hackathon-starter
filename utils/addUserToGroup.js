/*
 * addUserToGroup.js in /utils
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

exports.addUserToGroup =  (req, res, user, groupId, userByInvitation) => { // .todo RMS send name

  Group.findOne({_id: ObjectId(groupId)}, function (err, group) {
    if (err) {
      utils.errLog(req, res, 'utils.addUser.1', err, false);
      return '{success: false, err:' + err + '}';
    } else {
      // update users in group
      User.update({_id: ObjectId(user._id)}, {
        $addToSet: {
          groups: {
            gId: groupId,
            oNa: group.oNa,
            tit: group.tit
          }
        }
      }, function (err) {
        if (err) {
          utils.errLog(req, res, 'utils.addUser.2', err, false);
          return '{success: false, err:' + err + '}';
        } else {
          Group.update({_id: group._id}, {
            $addToSet: {
              mem: {
                mId: user._id,
                mNa: encryptor.decrypt(req.user.profile.name),
                eml: user.encryptedEmail
              }
            }
          }, function (err) {
            if (err) {
              utils.errLog(req, res, 'utils.addUser.3', err, false);
              return '{success: false, err:' + err + '}';
            } else {
              if (userByInvitation) {
                Group.update({_id: ObjectId(group._id)}, {$pull: {inv: {eml: user.email}}}, function (err) {
                  if (err) {
                    utils.errLog(req, res, 'utils.addUser.4', err, true);
                  } else {
                    res.redirect('/group/' + group._id);
                  }
                });
              } else {
                res.redirect('/group/' + group._id);
              }
            }
          });
        }
      });
    }
  });
};
