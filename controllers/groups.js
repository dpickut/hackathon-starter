/*
 * groups.js in /controllers
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

/**
 * Module dependencies.
 */


const User = require('../models/User');
const crypto = require('crypto');
const Group = require('../models/group');
const loadHeaderText = require('../utils/loadHeaderText');
const loadTranslationsText = require('../utils/addUserToGroup');
const addUserToGroup = require('../utils/loadHeaderText');
const getName = require('../utils/getName');
const encryptor = require('simple-encryptor')({ key: process.env.SIMPLE_ENCRYPTOR_KEY });
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const config = require('../config/config');
const fs = require('fs-extended');
const path = require('path');
const moment = require('moment');
const ObjectId = require('mongoose').Types.ObjectId;
const uniqid = require('uniqid');
const i18n = require('i18n');

/**
 * GET /groups of all groups .todo RMS add filter
 *
 */
exports.getGroups = (req, res, next) => {
  moment()
    .format('YYYY MM DD');
  var object = {};
  var now = moment();
  Group.find({}, (err, groups) => {
    if (err) {
      return next(err);
    }
    var returnData = {
      NAME: i18n.__('NAME'),
      CATEGORY: i18n.__('CATEGORY'),
      OWNER: i18n.__('OWNER'),
      MEMBERS: i18n.__('MEMBERS'),
      LAST_ACTIVE: i18n.__('LAST_ACTIVE')
    };
    returnData = loadHeaderText(req, res, returnData);
    returnData = loadTranslationsText(req, res, returnData);
    res.send({ success: true }, groups);

  });
};

/**
 * GET /getMygroups for user
 *
 */
exports.getMygroups = (req, res, next) => {
  var returnData = {
    title: i18n.__('MY_GROUPS'),
    MY_GROUPS: i18n.__('MY_GROUPS'),
    CREATE_GROUP: i18n.__('CREATE_GROUP'),
    EDIT_GROUP: i18n.__('EDIT_GROUP'),
    DELETE_GROUP: i18n.__('DELETE_GROUP'),
    ARE_YOU_A_HUMAN: i18n.__('ARE_YOU_A_HUMAN'),
    NAME: i18n.__('NAME'),
    CATEGORY: i18n.__('CATEGORY'),
    OWNER: i18n.__('OWNER'),
    MEMBERS: i18n.__('MEMBERS'),
    LAST_ACTIVE: i18n.__('LAST_ACTIVE'),
    PLEASE_SELECT_GROUP_TO_DELETE: i18n.__('PLEASE_SELECT_GROUP_TO_DELETE'),
    PLEASE_SELECT_GROUP_TO_EDIT: i18n.__('PLEASE_SELECT_GROUP_TO_EDIT')
  };

  var groups = [
    {
      id: '5baf2582d4e714382632d12a',
      tit: 'testTitle',
      cat: 'General',
      oNa: 'OwnerName',
      number: '22',
      las: '7/9/2018'
    },
    {
      id: '2',
      tit: 'testTitle',
      cat: 'General',
      oNa: 'OwnerName',
      number: '22',
      las: '7/9/2018'
    },
    {
      id: '3',
      tit: 'testTitle',
      cat: 'General',
      oNa: 'OwnerName',
      number: '22',
      las: '7/9/2018'
    },
    {
      id: '1',
      tit: 'testTitle',
      cat: 'General',
      oNa: 'OwnerName',
      number: '22',
      las: '7/9/2018'
    },
    {
      id: '2',
      tit: 'testTitle',
      cat: 'General',
      oNa: 'OwnerName',
      number: '22',
      las: '7/9/2018'
    },
    {
      id: '3',
      tit: 'testTitle',
      cat: 'General',
      oNa: 'OwnerName',
      number: '22',
      las: '7/9/2018'
    }, {
      id: '1',
      tit: 'testTitle',
      cat: 'General',
      oNa: 'OwnerName',
      number: '22',
      las: '7/9/2018'
    },
    {
      id: '2',
      tit: 'testTitle',
      cat: 'General',
      oNa: 'OwnerName',
      number: '22',
      las: '7/9/2018'
    },
    {
      id: '3',
      tit: 'testTitle',
      cat: 'General',
      oNa: 'OwnerName',
      number: '22',
      las: '7/9/2018'
    }, {
      id: '1',
      tit: 'testTitle',
      cat: 'General',
      oNa: 'OwnerName',
      number: '22',
      las: '7/9/2018'
    },
    {
      id: '2',
      tit: 'testTitle',
      cat: 'General',
      oNa: 'OwnerName',
      number: '22',
      las: '7/9/2018'
    },
    {
      id: '3',
      tit: 'testTitle',
      cat: 'General',
      oNa: 'OwnerName',
      number: '22',
      las: '7/9/2018'
    }, {
      id: '1',
      tit: 'testTitle',
      cat: 'General',
      oNa: 'OwnerName',
      number: '22',
      las: '7/9/2018'
    },
    {
      id: '2',
      tit: 'testTitle',
      cat: 'General',
      oNa: 'OwnerName',
      number: '22',
      las: '7/9/2018'
    },
    {
      id: '3',
      tit: 'testTitle',
      cat: 'General',
      oNa: 'OwnerName',
      number: '22',
      las: '7/9/2018'
    }, {
      id: '1',
      tit: 'testTitle',
      cat: 'General',
      oNa: 'OwnerName',
      number: '22',
      las: '7/9/2018'
    },
    {
      id: '2',
      tit: 'testTitle',
      cat: 'General',
      oNa: 'OwnerName',
      number: '22',
      las: '7/9/2018'
    },
    {
      id: '3',
      tit: 'testTitle',
      cat: 'General',
      oNa: 'OwnerName',
      number: '22',
      las: '7/9/2018'
    }
  ];

  var object = {};
  var now = moment();

  returnData = loadHeaderText(req, res, returnData);
  returnData = loadTranslationsText(req, res, returnData);
  returnData.csrf = res.locals._csrf;
  returnData.groupOwner = false;


  User.find({ _id: ObjectId(req.user._id) }, { groups: 1 }, (err, groups) => {
    if (err) {
      return next(err);
    }
    // find in
    var fields = {
      gid: 1,
      cat: 1,
      tit: 1,
      // des: 1,
      oNa: 1,
      mem: 1,
      cre: 1,
      las: 1
    };
    if (groups.length) {
      Group.find({ '_id': { $in: groups.gId } }, fields, (error, groupData) => {
        if (err) {
          return next(err);
        }
        for (i = 0; i < groupData.length; i++) {
          groupData[i].oNa = encryptor.decrypt(groupData[i].oNa);
          groupData.nbr = groupData.mem.length;
          delete groupData.mem;
        }
        if (req.user._id.equals(groupData.oId)) {
          returnData.groupOwner = true;
        }
        // res.render('groups/mygroups', {csrf: res.locals._csrf, groups: groupData, returnData}); .ToDo undelete this line when debuged

      });
    }

  });
  returnData.groups = groups;  // delete this line when debuged .ToDo
  res.render('groups/mygroups', returnData); // delete this line when debuged .ToDo

};


/**
 * GET /getGroup if user has access
 *
 */
exports.getGroup = (req, res, next) => {
  var groupId = req.param('groupId');
  var returnData = {
    title: i18n.__('GROUP_DATA'),
    GROUP_DATA: i18n.__('GROUP_DATA'),
    ARE_YOU_A_HUMAN: i18n.__('ARE_YOU_A_HUMAN'),
    INVITE_NEW_MEMBER: i18n.__('INVITE_NEW_MEMBER'),
    DELETE_MEMBER: i18n.__('DELETE_MEMBER'),
    ARE_YOU_A_HUMAN: i18n.__('ARE_YOU_A_HUMAN'),
    NAME: i18n.__('NAME'),
    EMAIL: i18n.__('EMAIL'),
    CATEGORY: i18n.__('CATEGORY'),
    CREATED: i18n.__('CREATED'),
    OWNER: i18n.__('OWNER'),
    MEMBERS: i18n.__('MEMBERS'),
    INVITATIONS: i18n.__('INVITATIONS'),
    GROUP_MEMBERS: i18n.__('GROUP_MEMBERS'),
    LAST_ACTIVE: i18n.__('LAST_ACTIVE'),
    TIMES_INVITED: i18n.__('TIMES_INVITED'),
    LAST_INVITED: i18n.__('LAST_INVITED')
  };
// debug data .ToDo remove after testing
  var groupData = {
    tit: 'my group',
    des: 'my group description d    llllllllllllllllll llllllllllllll llllllllllll llllllllllll ',
    cat: 'group category',
    oNa: 'joe smith',
    cre: '7/9/54',
    las: '2/2/18'
  };
  groupData.mem = [
    {
      mId: 1,
      tit: 'testTitle',
      eml: 'test@gmail.com',
      mcr: 'General',
      mNa: 'OwnerName',
      las: '7/9/2018'
    },
    {
      mId: 2,
      tit: 'testTitle',
      eml: 'test@gmail.com',
      mcr: 'General',
      mNa: 'OwnerName',
      las: '7/9/2018'
    },
    {
      mId: 3,
      tit: 'testTitle',
      eml: 'test@gmail.com',
      mcr: 'General',
      mNa: 'OwnerName',
      las: '7/9/2018'
    }
  ];

  groupData.inv = [
    {
      iId: 1,
      eml: 'test1@gmail.com',
      nIv: 1,
      las: '7/9/2018'
    },
    {
      iId: 2,
      eml: 'test2@gmail.com',
      nIv: 1,
      las: '7/9/2018'
    },
    {
      iId: 3,
      eml: 'test3@gmail.com',
      nIv: 2,
      las: '7/9/2018'
    }
  ];
  returnData = loadHeaderText(req, res, returnData);
  returnData = loadTranslationsText(req, res, returnData);
  returnData.csrf = res.locals._csrf;
  returnData.groupOwner = false;


  var object = {};
  var now = moment();
  var userId = req.param('userId');
  if (groupId) {
    var fields = {
      gid: 1,
      cat: 1,
      tit: 1,
      des: 1,
      oId: 1,
      gTyp: 1,
      oNa: 1,
      mem: 1,
      inv: 1,
      cre: 1,
      las: 1
    };
    if (ObjectId.isValid(groupId)) {
      Group.findOne({ _id: ObjectId(groupId) }, fields, (error, groupData) => {
        if (err) {
          return next(err);
        }
        // Check to see if user is part of group
        var userFound = false;
        if (groupData) {
          if (req.user && groupData.mem.length) {
            for (var i = 0; i < groupData.mem.length; i++) {
              if (req.user._id.equals(groupData.mem[i].mId)) {
                userFound = true;
              }
            }
            if (userFound == true) {
              if (req.user._id.equals(groupData.oId)) {
                returnData.groupOwner = true;
              }
              returnData.groupData = {
                gid: groupData._id,
                cat: groupData.cat,
                tit: groupData.tit,
                des: groupData.des,
                oNa: encryptor.decrypt(groupData.oNa),
                mem: groupData.mem
              };
              if (returnData.groupOwner) {
                returnData.groupData.inv = groupData.inv;
              }


              for (var i = 0; i < groupData.mem.length; i++) {
                returnData.groupData.mem[i].mNa = encryptor.decrypt(groupData.mem[i].mNa);
                returnData.groupData.mem[i].eml = encryptor.decrypt(groupData.mem[i].eml);
                returnData.groupData.mem[i].lasActive = moment(groupData.mem[i].las)
                  .format('YYYY-MM-DD');

              }
              res.render('groups/group', returnData);
            } else {
              req.flash('error', { msg: i18n.__('CURRENT_USER_NOT_MEMBER_OF_GROUP') });
              res.redirect(req.session.returnTo || '/');
              // res.send({
              //   success: false,
              //   error: 'Current User not Member of Group'
              // });
            }
          }
        } else {
          req.flash('error', { msg: i18n.__('GROUP_ID_NOT_FOUND"') });
          res.redirect(req.session.returnTo || '/');
          // res.send({
          //   success: false,
          //   error: 'GroupId not found'
          // });
        }

      });
    }
  }
};


/**
 * GET /getCreateGroup if user has access
 *
 */
exports.getCreateGroup = (req, res, next) => {

  var returnData = {
    title: 'Create Group',
    CREATE_GROUP: i18n.__('CREATE_GROUP'),
    NAME: i18n.__('NAME'),
    GROUP_NAME: i18n.__('GROUP_NAME'),
    DESCRIPTION: i18n.__('DESCRIPTION'),
    CATEGORY: i18n.__('CATEGORY'),
    WEBSITE: i18n.__('WEBSITE'),
    WEBSITE_URL: i18n.__('WEBSITE_URL'),
    SUBMIT: i18n.__('SUBMIT')
  };
  returnData = loadHeaderText(req, res, returnData);
  returnData = loadTranslationsText(req, res, returnData);
  returnData.csrf = res.locals._csrf;

  res.render('groups/createGroup', returnData);
};


/**
 * Post Create a group
 */

exports.postCreateGroup = (req, res) => {
  var tit = req.param('tit');
  var cat = req.param('cat');
  var des = req.param('des');
  var web = req.param('web');

  var obj = {
    oId: req.user._id,
    oNa: req.user.profile.name,
    tit: tit,
    des: des,
    cat: cat,
    web: web
  };
  var group = new Group(obj);
  group.save((err, newGroup) => {
    if (err) {
      return next(err);
    }
    // add owner to group and to  user id
    addUserToGroup(req, res, req.user, newGroup._id, false);

  });
};

/**
 * Post Update a group
 */

exports.postUpdateGroup = (req, res) => {
  var tit = req.param('tit');
  var cat = req.param('cat');
  var des = req.param('des');
  var web = req.param('web');

  var obj = {
    oId: req.user._id,
    oNa: req.user.profile.name,
    tit: tit,
    des: des,
    cat: cat,
    web: web
  };
  var group = new Group(obj);
  group.save((err, newGroup) => {
    if (err) {
      return next(err);
    }
    // add owner to group and to  user id
    addUserToGroup(req, res, req.user, newGroup._id, false);

  });
};


/**
 * Delete an group
 */

exports.deleteGroup = (req, res) => {
  var groupId = req.param('groupId');
  var data = req.param('data');

  Group.findOne({ _id: ObjectId(groupId) }, (err, group) => {
    if (err) {
      return next(err);
    }
    // Check to make sure current user is owner of group
    if (group.oId.equals(req.user._id)) {
      // remove all users from group
      User.update({}, { $pull: { groups: { gId: group._id } } }, (err) => {
        if (err) {
          return next(err);
        }
        group.remove({ _id: ObjectId(group._id) }, (err) => {
          if (err) {
            return next(err);
          }
          res.send({ success: true });
        });
      });
    }
  });
};


/**
 *  getGroupInvite Invite to a group
 */

exports.getGroupInvite = (req, res) => {
  var groupId = req.param('groupId');

  // moment().format('YYYY MM DD');
  // var object = {};
  // var now = moment();
  var returnData = {
    title: i18n.__('INVITE_TO_GROUP'),
    INVITE_NEW_MEMBER_TO_GROUP: i18n.__('INVITE_NEW_MEMBER_TO_GROUP'),
    CATEGORY: i18n.__('CATEGORY'),
    ENTER_EMAIL_ADDRESS: i18n.__('ENTER_EMAIL_ADDRESS'),
    EMAIL_SAMPLE: i18n.__('EMAIL_SAMPLE'),
    SEND_EMAIL_INVITATION: i18n.__('SEND_EMAIL_INVITATION')
  };

  returnData = loadHeaderText(req, res, returnData);
  returnData = loadTranslationsText(req, res, returnData);
  returnData.csrf = res.locals._csrf;

  var userId = req.param('userId');
  if (groupId) {
    var fields = {
      gid: 1,
      tit: 1,
      cat: 1,
      des: 1,
      oId: 1,
      gTyp: 1,
    };
    if (ObjectId.isValid(groupId)) {
      Group.findOne({ _id: ObjectId(groupId) }, fields, (error, groupData) => {
        if (err) {
          return next(err);
        }
        if (req.user._id.equals(groupData.oId)) {
          returnData.groupData = {
            gid: groupData._id,
            cat: groupData.cat,
            tit: groupData.tit,
            des: groupData.des
          };
          res.render('groups/groupInvite', returnData);
        } else {
          req.flash('error', { msg: i18n.__('GROUP_OWNER_MUST_MAKE_INVITES_TO_GROUP"') });
          res.redirect(req.session.returnTo || '/');
        }
      });
    }
  }
};

/**
 * Invitee accepts membership in group
 */

exports.postAcceptUser = (req, res) => { // .todo RMS send name
  var groupId = req.param('groupId');
  var invitationId = req.param('invitationId');

  var email = '';
  Group.findOne({ _id: ObjectId(groupId) }, (err, group) => {
    if (err) {
      return next(err);
    }
    for (i = 0; i < group.inv.length; i++) {
      if (group.inv[i].iId == invitationId) {
        // group.inv[i].iId = group.inv[i].eml;
        email = crypto.createHash('md5')
          .update(encryptor.decrypt(group.inv[i].eml))
          .digest('hex');
      }
    }
    if (email) {
      User.findOne({ email: email }, (err, mongoUser) => {
        if (err) {
          return next(err);
        }
        if (mongoUser) {
          if (mongoUser.member.typ === 'free') {
            req.flash('error', { msg: i18n.__('UPGRADE_YOUR_MEMBERSHIP_TO_JOIN_THE_GROUP"') });
            res.redirect(req.session.returnTo || '/');
            // res.send({
            //   success: true,
            //   err: i18n._('UPGRADE_YOUR_MEMBERSHIP_TO_JOIN_THE_GROUP')
            // });
          } else {
            addUserToGroup(req, res, mongoUser, groupId, true);
          }
        } else {
          req.flash('error', { msg: i18n.__('INVITE_TO_GROUP_IS_NOT_A_MEMBER"') });
          res.redirect(req.session.returnTo || '/');
          // res.send({
          //   success: true,
          //   err: i18n._('INVITE_TO_GROUP_IS_NOT_A_MEMBER')
          // });
        }
      });
    } else {
      req.flash('error', { msg: i18n.__('INVITATION_NOT_FOUND"') });
      res.redirect(req.session.returnTo || '/');
      // res.send({
      //   success: true,
      //   err: i18n._('INVITATION_NOT_FOUND')
      // });
    }
  });
};

/**
 * Invite User to group
 */

exports.postInviteUser = (req, res) => { // .todo RMS send name
  var groupId = req.param('groupId');
  var invitedUserEmail = req.param('email');
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.nodeMailerEmail,
      pass: process.env.googleMailPassword
    }
  });
  var now = moment();
  if (invitedUserEmail && groupId) {
    invitedUserEmail = invitedUserEmail.toLowerCase();
    // get group owners name
    var nam = getName(req, res, req.user);

    Group.findOne({ _id: ObjectId(groupId) }, (err, group) => {
      if (err) {
        return next(err);
      }
      // check that logged in user is owner of group.
      if (group.oId.equals(req.user._id)) {
        var invitationId = uniqid();
        var acceptUrl = config.base_url + 'invitation/' + group._id + '/' + invitationId;
        var existingInvitation = false;
        // check if email already invited and if it is less than 3 then update group and invite

        for (i = 0; i < group.inv.length; i++) {
          if (group.inv[i].eml == invitedUserEmail) {
            existingInvitation = true;
          }
        }
        var data = {
          acceptUrl: acceptUrl,
          nam: nam,
          tit: group.tit
        };

        if (existingInvitation === true) {
          if (group.inv[i].nIv === 3) {
            req.flash('error', { msg: i18n.__('MAX_INVITE_RETRUY_EXCEEDED_WITH_NO_RESPONSE"') });
            res.redirect(req.session.returnTo || '/');
            // res.send({
            //   success: false,
            //   msg: i18n._('MAX_INVITE_RETRUY_EXCEEDED_WITH_NO_RESPONSE')
            // });
          } else {
            group.inv[i].nIv++;
          }
        } else {
          // check to see if invited user is a member and membership status.
          var hashEmail = crypto.createHash('md5')
            .update(invitedUserEmail)
            .digest('hex');
          User.findOne({ email: hashEmail }, (err, mongoUser) => {
            if (err) {
              return next(err);
            }
            if (mongoUser) {
              if (mongoUser.member.typ === 'free') {
                var templateName = 'group_free_Invite.handlebars';
              } else {
                var templateName = 'group_member_Invite.handlebars';
              }
            } else {
              var templateName = 'group_non_member_Invite.handlebars';
            }

            var language = 'en';
            if (req.user.profile.language) {
              language = req.user.profile.language;
            }

            fs.readFile(path.resolve(__dirname, '../views/htmlPdf/' + language + '/' + templateName), (err, template) => {
              if (err) {
                return next(err);
              }
              // make the buffer into a string
              var source = template.toString();
              // console.log(emailId);
              // call the render function
              var template2 = handlebars.compile(source);
              var outputString = template2(data);

              var eMailData = {
                to: invitedUserEmail,
                subject: i18n.__('YOU_HAVE_BEEN_INVITED_TO_JOIN_A_FLOWER_ARRANGING_GROUP') + group.tit + i18n.__('_BY_') + nam,
                message: outputString
              };

              // invite user to group
              transporter.sendMail({
                from: process.env.SITE_EMAIL_FROM_ADDESS,
                to: eMailData.to,
                subject: eMailData.subject,
                html: eMailData.message
              }, (err, info) => {
                Group.update({ _id: ObjectId(mongoUser._id) }, {
                  $addToSet: {
                    inv: {
                      gId: groupId,
                      iId: invitationId, // invitation Id
                      eml: crypto.createHash('md5')
                        .update(invitedUserEmail)
                        .digest('hex'),
                      encryptedEmail: encryptor.encrypt(invitedUserEmail), // invitee email
                      las: now
                    }
                  }
                  // Person.update({'items.id': 2}, {'$set': {
                  //         'items.$.name': 'updated item2',
                  //         'items.$.value': 'two updated'
                  //     }}, function(err) { ...
                }, (err) => {
                  if (err) {
                    return next(err);
                  }
                  res.redirect('../group/' + groupId);
                });
              });
            });
          });
        }
      } else {
        req.flash('errors', { msg: i18n.__('YOU_MUST_BE_THE_GROUP_OWNER_TO_ADD_USERS') });
        res.redirect(req.session.returnTo || '/');
      }
    });
  }
};

/**
 * Delete User from group
 */

exports.deleteUser = (req, res) => {
  var groupId = req.param('groupId');
  var memberId = req.param('memberId');
  Group.findOne({ _d: ObjectId(groupId) }, (err, group) => {
    if (err) {
      return next(err);
    }
    if ((req.user._id.equals(memberId) || req.user._id.equals(group.oId)) && !group.oid.equals(memberId)) {
      User.findOne({ _id: ObjectId(memberId) }, (err, mongoUser) => {
        if (err) {
          return next(err);
        }
        Group.update({ _id: ObjectId(group._id) }, { $pull: { mem: { mId: mongoUser._id } } }, (err) => {
          if (err) {
            return next(err);
          }
          User.update({ _id: ObjectId(mongoUser._id) }, { $pull: { groups: { gId: group._id } } }, (err) => {
            if (err) {
              return next(err);
            }
            res.send({ success: true });

          });

        });

      });
    } else {
      if (group.oid.equals(memberId)) {
        req.flash('error', { msg: i18n.__('GROUP_OWNER_CAN_NOT_DELETE_THEMSELVES"') });
        res.redirect(req.session.returnTo || '/');
        // res.send({
        //   success: false,
        //   msg: i18n.__('GROUP_OWNER_CAN_NOT_DELETE_THEMSELVES')
        // });
      } else {
        req.flash('error', { msg: i18n.__('YOU_CAN_ONLY_DELETE_YOURSELF_FROM_THE_GROUP"') });
        res.redirect(req.session.returnTo || '/');
        // res.send({
        //   success: false,
        //   msg: i18n.__('YOU_CAN_ONLY_DELETE_YOURSELF_FROM_THE_GROUP')
        // });
      }
    }
  });
};



