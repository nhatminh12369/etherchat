import { sha256 } from 'ethereumjs-util';

var Wallet = require('ethereumjs-wallet');
var crypto = require('crypto');
var web3 = require('../ethereum/web3').default;
var utils = require('../lib/Utils');
var compiledEtherMessage = require('../ethereum/build/EtherMessage.json');
var Tx = require('ethereumjs-tx');
var Relationship = require('./Relationship');
var EventHandler = require('./EventHandler').default;
var LocalStorageManager = require('./LocalStorageManager').default;

var contractAddress = '0x8f319E3e01c9cF4D98D9157eB0FB1Fba844C59ed';
// RINKEBY ADDRESS: 0x8be64d294c9bca7bef2f07be60b5a69a2b6506ce

class Account {
    constructor() {
        this.isValid = false;
        this.isJoined = false;
        this.isReady = false;
        this.balance = 0;
        this.getContract();
    }

    getContract = async () => {
        this.contract = await new web3.eth.Contract(JSON.parse(compiledEtherMessage.interface), 
                contractAddress);
        this.isReady = true;
        this.storageManager = new LocalStorageManager();
        this.storageManager.initialize();

        this.eventHandler = new EventHandler(this.getAddress(), this.contract, this.storageManager);
        this.eventHandler.start();
        await this.getAccountInfo();
        await this.getContactList();
    }

    getAccountInfo = async () => {
        var result = await this.callToContractMethod(this.contract.methods.members(this.getAddress()));
        if (result.isMember == 1) {
            this.isJoined = true;
        }
    }

    getContactList = async () => {
        var result = await this.callToContractMethod(this.contract.methods.getContactList());
        console.log('Contact list result: ');
        console.log(result);
    }

    convertToMemberInfo = (hexData) => {
        var member = {};
        member.publicKey = hexData.substr(2, 128);
        member.name = Buffer.from(hexData.substr(130, 64), 'hex').toString('ascii');
        member.avatarUrl = Buffer.from(hexData.substr(194, 64), 'hex').toString('ascii');
        member.isMember = parseInt(hexData.substr(194+128, 64), 'hex');
        console.log(hexData.substr(194+128, 64));
        return member;
    }

    setPrivateKey = (privateKey) => {        
        try {
            var privateKeyBuffer = Buffer.from(privateKey, 'hex');
            this.account = Wallet.fromPrivateKey(privateKeyBuffer);
            this.isValid = true;
        } catch (err) {
        }
        this.getAccountBalance();
        return this.isValid;
    }

    getAccountBalance = async () => {
        if (window.localStorage.balance != undefined) {
            this.balance = window.localStorage.balance;
        }
        this.balance = await web3.eth.getBalance(this.account.getAddress().toString('hex'));
        window.localStorage.setItem("balance", this.balance);
    }

    getPublicKeyBuffer() {
        return this.account.getPublicKey();
    }

    getAddress = () => {
        if (this.isValid) {
            return '0x' + this.account.getAddress().toString('hex');
        }
    }

    computeSecret = (publicKey) => {
        var a = crypto.createECDH('secp256k1');
        a.setPrivateKey(this.account.getPrivateKey());
        return a.computeSecret(publicKey);
    }

    joinContract = () => {
        var publicKey = this.account.getPublicKey();
        var publicKeyLeft = '0x' + publicKey.toString('hex', 0, 32);
        var publicKeyRight = '0x' + publicKey.toString('hex', 32, 64);

        this.sendToContractMethod(this.contract.methods.join(publicKeyLeft, publicKeyRight));
    }

    addContact = (address) => {
        var method = this.contract.methods.addContact(address);
        console.log(method);
        this.sendToContractMethod(method);
    }

    confirmContactRequest = (address) => {
        if (web3.utils.isAddress(address)) {
            var method = this.contract.methods.confirmContactRequest(address);
            this.sendToContractMethod(method);
            return true;
        }
        return false;
    }

    sendMessage = (toAddress, message) => {
        if (web3.utils.isAddress(address)) {
            //utils.encrypt(message, this.computeSecret());
            return true;
        }
        return false;
    }

    sendToContractMethod = async (method) => {
        var data = method.encodeABI();
        var estimatedGas = await method.estimateGas({
            gas: 3000000,
            from: this.getAddress()
        });
        var transactionCount = await web3.eth.getTransactionCount(this.account.getAddress().toString('hex'));
        var gasPrice = await web3.eth.getGasPrice();

        var rawTx = {
            nonce: parseInt(transactionCount),
            gasPrice: parseInt(gasPrice),
            gasLimit: parseInt(estimatedGas),
            to: contractAddress,
            value: 0,
            data: data
        }
        var tx = new Tx(rawTx);
        tx.sign(this.account.getPrivateKey());
        var serializedTx = tx.serialize();

        web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).on('receipt', (error, result) => {
            if (error) {
                console.log(error);
            } else {
                console.log(result);
            }
        });
    }

    callToContractMethod = async (method) => {
        var data = method.encodeABI();
        return await web3.eth.call({
            to: contractAddress,
            from: this.getAddress(),
            data: data
        });
    }

    getContactList = async () => {
        
    }

    getPendingInvitation = async () => {

    }
}

class DataManager {
    constructor(account) {
        this.account = account;
    }

    getContactList = async () => {
        var lastUpdatedBlock = window.localStorage.lastUpdatedBlock;
        var localInvitationList = window.localStorage.localInvitationList;
        var localContactList = window.localStorage.localContactList;

        if (lastUpdatedBlock != undefined) {
            lastUpdatedBlock = 0;
            localInvitationList = [];
            localContactList = [];
        }

        var rawInvitations = await contract.getPastEvents('addContactEvent',{
            filter: {to: account.getAddress()},
            fromBlock: lastUpdatedBlock
        });

        for (var i=0;i<rawInvitations.count;i++) {
            var user = {};
            user.address = rawInvitations[i].address;
            user.relationship = Relationship.Invited;
            localInvitationList.push(user);
        }

        var rawSentInvitations = await contract.getPastEvents('messageSentEvent',{
            filter: {from: account.getAddress()},
            fromBlock: lastUpdatedBlock
        });

        for (var i=0;i<rawSentInvitations.count;i++) {
            var user = {};
            user.address = rawInvitations[i].address;
            user.relationship = Relationship.Invited;
            localInvitationList.push(user);
        }

        var rawContactList = await contract.getPastEvents('messageSentEvent',{
            filter: {from: account.getAddress()},
            fromBlock: lastUpdatedBlock
        });



        var contactList = [];
        

        var result = await this.contract.methods.getContactList().call();
        return result;
    }
}

export default Account;