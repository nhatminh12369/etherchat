// Copyright (c) 2018 Nguyen Vu Nhat Minh
// Distributed under the MIT software license, see the accompanying file LICENSE

module.exports.APP_NAME = "EtherChat";
module.exports.GITHUB_LINK = "https://github.com/nhatminh12369/etherchat";
module.exports.MEDIUM_LINK = "https://medium.com/@leonardnguyen/etherchat-decentralized-messaging-application-on-ethereum-network-part-1-253e5078770b";

module.exports.ACTION = {
    ADD_CONTACT: 'ADD_CONTACT_ACTION',
    SELECT_CONTACT: 'SELECT_CONTACT_ACTION',
    OPEN_UPDATE_PROFILE: 'OPEN_UPDATE_PROFILE',
    OPEN_PRIVATE_KEY_MODAL: 'OPEN_PRIVATE_KEY_MODAL',
    OPEN_GUIDE: 'OPEN_GUIDE',
    OPEN_SETTINGS_MODAL: 'OPEN_SETTINGS_MODAL',
    OPEN_TRANSACTION_MODAL: 'OPEN_TRANSACTION_MODAL',
    REJECT_TRANSACTION: 'REJECT_TRANSACTION',
    APPROVE_TRANSACTION: 'APRROVE_TRANSACTION'
}

module.exports.EVENT = {
    CONTRACT_READY: 'CONTRACT_READY',
    CONTACT_LIST_UPDATED: 'CONTACT_LIST_UPDATED',
    MESSAGES_UPDATED: 'MESSAGES_UPDATED',
    ACCOUNT_BALANCE_UPDATED: 'ACCOUNT_BALANCE_UPDATED',
    ACCOUNT_INFO_UPDATED: 'ACCOUNT_INFO_UPDATED',
    PENDING_TRANSACTION_UPDATED: 'PENDING_TRANSACTION_UPDATED',
    ENCOUNTERED_ERROR: 'ENCOUNTERED_ERROR',
    ON_ERROR: 'onError',
    ON_RECEIPT: 'onReceipt',
    ON_APPROVED: 'onApproved',
    ON_REJECTED: 'onRejected'
}

module.exports.SENT_STATUS = {
    PENDING: 1,
    SUCCESS: 2,
    FAILED: 3
}

module.exports.Relationship = {
    NoRelation: 0,
    Requested: 1,
    Connected: 2,
    Blocked: 3
}