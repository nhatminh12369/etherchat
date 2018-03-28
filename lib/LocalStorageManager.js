
var {Relationship} = require('./Relationship');
var appDispatcher = require('../components/AppDispatcher');
var Constant = require('../components/Constant');
var utils = require('../lib/Utils');

class LocalStorageManager {

    // getContactData(address) {
    //     if (typeof(Storage) !== 'undefined' && window.localStorage[address] != undefined) {
    //         return JSON.parse(window.localStorage[address]);
    //     } else {
    //         return undefined;
    //     }
    // }

    // getContactAddresses() {
    //     if (typeof(Storage) !== 'undefined' && window.localStorage.contactAddresses != undefined) {
    //         return JSON.parse(window.localStorage.contactAddresses);
    //     } else {
    //         return [];
    //     }
    // }

    initialize() {
        this.contacts = {};
        this.loadLocalContactAddresses();
        this.loadContactMessages();
        appDispatcher.dispatch({
            action: Constant.EVENT.CONTACT_LIST_UPDATED
        });
    }

    loadLocalContactAddresses = () => {
        var rawContactAddresses = window.localStorage.contactAddresses;
        if (rawContactAddresses != undefined) {
            this.contactAddresses = JSON.parse(rawContactAddresses);
        } else {
            this.contactAddresses = [];
        }
    }

    loadContactMessages = () => {
        for (var i=0;i<this.contactAddresses.length;i++) {
            var address = this.contactAddresses[i];
            var localContact = window.localStorage[address];
            this.contacts[address] = JSON.parse(localContact);
        }
    }

    addContact = (address, publicKey, name, avatarUrl, relationship) => {
        var data = this.contacts[address];
        if (data == undefined) {
            var member = {};
            member.messages = [];
            member.relationship = relationship;
            window.localStorage.setItem(address, JSON.stringify(member));
            this.contacts[address] = member;

            this.contactAddresses.push(address);
            window.localStorage.setItem('contactAddresses', JSON.stringify(this.contactAddresses));
        } else if (relationship == Relationship.Blocked || relationship == Relationship.Connected) {
            data.relationship = relationship;
            data.publicKey = publicKey;
            data.name = name;
            data.avatarUrl = avatarUrl;
            window.localStorage.setItem(address, JSON.stringify(data));
        }
    }

    addInvitationEvents = (events) => {
        for (var i=0;i<events.length;i++) {
            this.addContact(events[i].returnValues["from"], "", "", "", Relationship.NoRelation);
        }
    }

    addRequestEvents = (events) => {
        for (var i=0;i<events.length;i++) {
            this.addContact(events[i].returnValues["to"], "", "", "", Relationship.Requested);
        }
    }

    addMyAcceptContactEvents = (events) => {
        for (var i=0;i<events.length;i++) {
            this.addContact(events[i].returnValues["to"], "", "", "", Relationship.Connected);
        }
    }

    addAcceptContactEvents = (events) => {
        for (var i=0;i<events.length;i++) {
            this.addContact(events[i].returnValues["from"], "", "", "", Relationship.Connected);
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
                localMessages.messages[i].isPending = false;
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
        message.isPending = true;
        message.isMine = true;
        this.contacts[to].messages.push(message);
        window.localStorage.setItem(to, JSON.stringify(this.contacts[to]));
    }

    setPrivateKey(privateKey) {
        window.localStorage.setItem("privateKey", privateKey);
        window.localStorage.setItem("currentDataBlock", "0");
        window.localStorage.setItem("ethNetwork", "4");
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