// Copyright (c) 2018 Nguyen Vu Nhat Minh
// Distributed under the MIT software license, see the accompanying file LICENSE

import appDispatcher from '../core/AppDispatcher';
import Constant from '../support/Constant';
import utils from '../support/Utils';

class LocalStorageManager {
    initialize() {
        this.contacts = {}; // Map Ethereum addresses with all messages and information belong to an address
        this.loadLocalContactAddresses();
        this.loadContactMessages();
        appDispatcher.dispatch({
            action: Constant.EVENT.CONTACT_LIST_UPDATED
        });
    }

    loadLocalContactAddresses = () => {
        this.contactAddresses = []; // A list of Ethereum addresses in the contact list of the current user.
        if (typeof(Storage) != 'undefined') {
            var rawContactAddresses = window.localStorage.contactAddresses;
            if (rawContactAddresses != undefined) {
                this.contactAddresses = JSON.parse(rawContactAddresses);
            }
        }
    }

    loadContactMessages = () => {
        if (typeof(Storage) != 'undefined') {
            for (var i=0;i<this.contactAddresses.length;i++) {
                var address = this.contactAddresses[i];
                var localContact = window.localStorage[address];
                this.contacts[address] = JSON.parse(localContact);
            }
        }
    }

    addContact = (address, relationship) => {
        var data = this.contacts[address];
        if (data == undefined) {
            var member = {};
            member.messages = [];
            member.relationship = relationship;
            window.localStorage.setItem(address, JSON.stringify(member));
            this.contacts[address] = member;

            this.contactAddresses.push(address);
            window.localStorage.setItem('contactAddresses', JSON.stringify(this.contactAddresses));
        }
    }

    updateContact = (address, publicKey, name, avatarUrl, relationship) => {
        var data = this.contacts[address];
        if (data != undefined) {
            if (data.relationship < relationship) {
                data.relationship = relationship;
            }
            if (publicKey) {
                data.publicKey = publicKey;
            }
            if (name) {
                data.name = name;
            }
            if (avatarUrl) {
                data.avatarUrl = avatarUrl;
            }
            window.localStorage.setItem(address, JSON.stringify(data));
        }
    }

    addInvitationEvents = (events) => {
        for (var i=0;i<events.length;i++) {
            this.addContact(events[i].returnValues["from"], Constant.Relationship.NoRelation);
        }
    }

    addRequestEvents = (events) => {
        for (var i=0;i<events.length;i++) {
            this.addContact(events[i].returnValues["to"], Constant.Relationship.Requested);
        }
    }

    addMyAcceptContactEvents = (events) => {
        for (var i=0;i<events.length;i++) {
            this.updateContact(events[i].returnValues["to"], "", "", "", Constant.Relationship.Connected);
        }
    }

    addAcceptContactEvents = (events) => {
        for (var i=0;i<events.length;i++) {
            this.updateContact(events[i].returnValues["from"], "", "", "", Constant.Relationship.Connected);
        }
    }

    addMessageFromFriendEvent = (event) => {
        var data = event.returnValues;
        var fromAddress = data.from;
        var message = {};
        message.isMine = false;
        message.message = data.message;
        message.encryption = utils.hexStringToAsciiString(data.encryption);
        message.txHash = event.transactionHash;

        this.contacts[fromAddress].messages.push(message);

        window.localStorage.setItem(fromAddress, JSON.stringify(this.contacts[fromAddress]));
    }

    addMyMessageEvent = (event) => {
        var data = event.returnValues;
        var localMessages = this.contacts[data.to];
        
        var noMatchingItem = true;
        for (var i=localMessages.messages.length-1; i>=0;i--) {
            if (event.transactionHash == localMessages.messages[i].txHash) {
                localMessages.messages[i].status = Constant.SENT_STATUS.SUCCESS;
                window.localStorage.setItem(data.to, JSON.stringify(this.contacts[data.to]));
                noMatchingItem = false;
            }
        }
        if (noMatchingItem) {
            var message = {};
            message.isMine = true;
            message.message = data.message;
            message.encryption = utils.hexStringToAsciiString(data.encryption);
            message.txHash = event.transactionHash;
            localMessages.messages.push(message);
            window.localStorage.setItem(data.to, JSON.stringify(this.contacts[data.to]));
        }
    }

    addMyLocalMessage = (message, to, encryption, txHash) => {
        var message = {message, encryption, txHash};
        message.status = Constant.SENT_STATUS.PENDING;
        message.isMine = true;
        this.contacts[to].messages.push(message);
        window.localStorage.setItem(to, JSON.stringify(this.contacts[to]));
    }

    updateLocalMessage = (toAddress, txHash, status) => {
        var localMessages = this.contacts[toAddress];
        for (var i=localMessages.messages.length-1; i>=0;i--) {
            if (txHash == localMessages.messages[i].txHash) {
                localMessages.messages[i].status = status;
                window.localStorage.setItem(toAddress, JSON.stringify(this.contacts[toAddress]));
            }
        }
    }

    storePrivateKeyAndAddress(privateKey, address) {
        if (typeof(Storage) !== 'undefined') {
            window.localStorage.setItem("privateKey", privateKey);
            window.localStorage.setItem("address", address);
            window.localStorage.setItem("currentDataBlock", "0");
            window.localStorage.setItem("ethNetwork", "4");
        }
    }

    getPrivateKey() {
        if (typeof(Storage) !== 'undefined') {
            return window.localStorage.privateKey;
        }
    }

    getAddress() {
        if (typeof(Storage) !== 'undefined') {
            return window.localStorage.address;
        }
    }

    setBalance(balance) {
        if (typeof(Storage) !== 'undefined') {
            window.localStorage.setItem('balance', balance);
        }
    }

    getBalance() {
        if (typeof(Storage) !== 'undefined' && window.localStorage.balance != undefined) {
            return window.localStorage.balance;
        } else {
            return "0";
        }
    }

    setName(name) {
        if (typeof(Storage) !== 'undefined' && name != "") {
            window.localStorage.setItem('name', name);
        }
    }

    getName() {
        if (typeof(Storage) !== 'undefined' && window.localStorage.name != undefined) {
            return window.localStorage.name;
        } else {
            return "";
        }
    }

    setAvatarUrl(avatarUrl) {
        if (typeof(Storage) !== 'undefined' && avatarUrl) {
            window.localStorage.setItem('avatarUrl', avatarUrl);
        }
    }

    getAvatarUrl() {
        if (typeof(Storage) !== 'undefined' && window.localStorage.avatarUrl != undefined) {
            return window.localStorage.avatarUrl;
        } else {
            return "";
        }
    }

    setJoinedStatus(isJoined) {
        if (typeof(Storage) !== 'undefined') {
            window.localStorage.setItem('isJoined', isJoined);
        }
    }

    getJoinedStatus() {
        if (typeof(Storage) !== 'undefined' && window.localStorage.isJoined != undefined) {
            return window.localStorage.isJoined;
        } else {
            return false;
        }
    }

    // Get current block number of contract events' data (message events, invitation events...)
    getCurrentDataBlock() {
        return parseInt(window.localStorage.currentDataBlock);
    }

    setCurrentDataBlock(blockNumber) {
        window.localStorage.setItem('currentDataBlock', blockNumber);
    }

    setAskForTransactionApproval(boolValue) {
        if (typeof(Storage) !== 'undefined') {
            window.localStorage.setItem('askForTransactionApproval', boolValue);
        }
    }
    
    getAskForTransactionApproval() {
        if (typeof(Storage) !== 'undefined' && window.localStorage.askForTransactionApproval) {
            return (window.localStorage.askForTransactionApproval == "true");
        } else {
            return false;
        }
    }

    removeNetworkDependentData() {
        if (typeof(Storage) !== 'undefined') {
            var rawAddresses = window.localStorage.contactAddresses;
            if (rawAddresses != undefined) {
                var addresses = JSON.parse(rawAddresses);
                for (var i=0;i<addresses.length;i++) {
                    window.localStorage.removeItem(addresses[i]);
                }
                window.localStorage.removeItem('contactAddresses');
            }
            window.localStorage.removeItem('balance');
            window.localStorage.removeItem('isJoined');
            window.localStorage.removeItem('name');
            window.localStorage.removeItem('avatarUrl');
            window.localStorage.setItem('currentDataBlock', '0');
        }
    }

    clearMessages = (contacts) => {
        window.localStorage.setItem('currentDataBlock', "0");
        window.localStorage.removeItem('contactAddresses');
        for (var i=0;i<contacts.length;i++) {
            window.localStorage.removeItem(contacts[i]);
        }
    }
}

export default LocalStorageManager;