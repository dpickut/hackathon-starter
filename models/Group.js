/*
 * Group.js in /models
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

const mongoose = require('mongoose');
const  Schema = mongoose.Schema;

/**
 * Getters
 */

var getTags = function (tags) {
    return tags.join(',');
};

/**
 * Setters
 */

var setTags = function (tags) {
    return tags.split(',');
};

/**
 * Group Schema
 */


var GroupSchema = new Schema({
    tit: {type: String, default: '', trim: true},  // english title
    des: {type: String, default: '', trim: true},  // english description
    web: {type: String, default: '', trim: true},  // group web link
    ldes: [{
        lan: {type: String, default: '', trim: true},
        des: {type: String, default: '', trim: true}
    }],  // multi language description
    cat: {type: String, default: '', index: true, trim: true}, // categroy
    gtyp: {type: String, default: '', index: true, trim: true},  // normal or enterprisemembershipsLeft: {type: Number, default: 10}  // used for enterprise type group.
    oId: {type: Schema.ObjectId, index: true, ref: 'User'}, // Id or owner of group
    oNa: {type: String, default: '', trim: true}, // name owner of group
    mem: [{ // group members
        mId: {type: Schema.ObjectId, index: true, ref: 'User'}, // Id of group member
        mNa: {type: String, default: ''}, // member name
        eml: {type: String}, // email encrypted 2 way
        mcr: {type: Date, default: Date.now},  // created
        las: {type: Date, default: Date.now},  // last active
        tmp: {type: String} // temp txt for reformatted date
    }],
    inv: [{
        eml: {type: String}, // hashed email
        encryptedEmail: {type: String}, // encrypted 2 way
        nIv: {type: Number, default: 1}, // number of invites
        iId: {type: String, default: '', trim: true}, // unique 18 bit number for invitation validation
        las: {type: Date}  //date invite last made
    }],
    tag: {type: [], get: getTags, set: setTags}, // tag
    cre: {type: Date, default: Date.now},  // created
    las: {type: Date, default: Date.now}   // last edit
});

GroupSchema.index({_id: 1, mem: 1});

module.exports = mongoose.model('Group', GroupSchema);
