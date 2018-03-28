import { sha256 } from 'ethereumjs-util';

var Wallet = require('ethereumjs-wallet');
var crypto = require('crypto');
var web3 = require('../ethereum/web3').default;
var utils = require('../lib/Utils');
var compiledContract = require('../ethereum/build/CryptoMessenger.json');
var Tx = require('ethereumjs-tx');
var Relationship = require('./Relationship');
var EventHandler = require('./EventHandler').default;
var LocalStorageManager = require('./LocalStorageManager').default;
import appDispatcher from '../components/AppDispatcher';
var Constant = require('../components/Constant');

class Account {
    constructor() {
        this.isJoined = false;
        // this.isReady = false;
        this.balance = 0;
        this.name = "";
        this.avatarUrl = "";
        this.numPendingTx = 0;
        this.initialize();
    }

    initialize = async () => {
        await this.getContract();
        this.startStorageManager();
        await this.startEventHandler();
        // this.isReady = true;
    }

    getContract = async () => {
        this.contract = await new web3.eth.Contract(JSON.parse(compiledContract.interface), 
                Constant.ENV.ContractAddress);
    }

    startStorageManager = () => {
        this.storageManager = new LocalStorageManager();
        this.storageManager.initialize();
        this.balance = this.storageManager.getBalance();
        this.name = this.storageManager.getName();
        this.avatarUrl = this.storageManager.getAvatarUrl();
        this.isJoined = this.storageManager.getJoinedStatus();
    }

    startEventHandler = async () => {
        var address = this.getAddress();
        if (address) {
            this.eventHandler = new EventHandler(address, this.contract, this.storageManager);
            this.eventHandler.start();
            await this.getProfile();
            await this.getContactList();
        }
    }

    getProfile = async () => {
        var result = await this.contract.methods.members(this.getAddress()).call();
        if (result.isMember == 1) {
            this.isJoined = true;
            this.storageManager.setJoinedStatus(true);
            this.name = utils.hexStringToAsciiString(result.name);
            this.storageManager.setName(this.name);
            this.avatarUrl = utils.hexStringToAsciiString(result.avatarUrl);
            this.storageManager.setAvatarUrl(this.avatarUrl);
            appDispatcher.dispatch({
                action: Constant.EVENT.ACCOUNT_INFO_UPDATED
            })
        }
    }

    updateBalance = async () => {
        this.balance = await web3.eth.getBalance(this.walletAccount.getAddress().toString('hex'));
        this.storageManager.setBalance(this.balance);
        appDispatcher.dispatch({
            action: Constant.EVENT.ACCOUNT_BALANCE_UPDATED
        })
    }

    getContactList = async () => {
        var result = await this.callToContractMethod(this.contract.methods.getContactList());
    }

    convertToMemberInfo = (hexData) => {
        var member = {};
        member.publicKey = hexData.substr(2, 128);
        member.name = Buffer.from(hexData.substr(130, 64), 'hex').toString('ascii');
        member.avatarUrl = Buffer.from(hexData.substr(194, 64), 'hex').toString('ascii');
        member.isMember = parseInt(hexData.substr(194+128, 64), 'hex');
        return member;
    }

    setPrivateKey = (privateKey) => {
        var isValid = false;
        try {
            var privateKeyBuffer = Buffer.from(privateKey, 'hex');
            this.walletAccount = Wallet.fromPrivateKey(privateKeyBuffer);
            this.storageManager.setPrivateKey(privateKey);
            isValid = true;
        } catch (err) {
        }
        this.updateBalance();
        return isValid;
    }

    getPublicKeyBuffer() {
        return this.walletAccount.getPublicKey();
    }

    getAddress = () => {
        if (this.walletAccount) {
            return '0x' + this.walletAccount.getAddress().toString('hex');
        } else {
            return "";
        }
    }

    computeSecret = (publicKey) => {
        var a = crypto.createECDH('secp256k1');
        a.generateKeys();
        a.setPrivateKey(this.walletAccount.getPrivateKey());
        return a.computeSecret(publicKey);
    }

    joinContract = () => {
        var publicKey = this.walletAccount.getPublicKey();
        var publicKeyLeft = '0x' + publicKey.toString('hex', 0, 32);
        var publicKeyRight = '0x' + publicKey.toString('hex', 32, 64);

        this.sendToContractMethod(this.contract.methods.join(publicKeyLeft, publicKeyRight));
    }

    addContact = (address) => {
        var method = this.contract.methods.addContact(address);
        this.sendToContractMethod(method);
    }

    acceptContactRequest = (address) => {
        var method = this.contract.methods.acceptContactRequest(address);
        this.sendToContractMethod(method);
    }

    updateProfile = (name, avatarUrl) => {
        var nameHex = '0x' + Buffer.from(name, 'ascii').toString('hex');
        var avatarUrlHex = '0x' + Buffer.from(avatarUrl, 'ascii').toString('hex');
        var method = this.contract.methods.updateProfile(nameHex, avatarUrlHex);
        this.sendToContractMethod(method);
    }

    sendMessage = async (toAddress, message) => {
        var publicKey = this.storageManager.contacts[toAddress].publicKey;
        var encryptedRaw = utils.encrypt(message, this.computeSecret(Buffer.from(publicKey, 'hex')));
        var encryptedMessage = '0x' + encryptedRaw.toString('hex');
        var method = this.contract.methods.sendMessage(toAddress, encryptedMessage, utils.getEncryptAlgorithmInHex());
        var txHash = await this.sendToContractMethod(method);
        this.storageManager.addMyLocalMessage(encryptedMessage, toAddress, utils.getEncryptAlgorithm(), txHash);
        appDispatcher.dispatch({
            action: Constant.EVENT.MESSAGES_UPDATED,
            data: toAddress
        })
    }

    sendToContractMethod = async (method) => {
        var data = method.encodeABI();
        var estimatedGas = await method.estimateGas({
            gas: 3000000,
            from: this.getAddress()
        });
        var transactionCount = await web3.eth.getTransactionCount(this.walletAccount.getAddress().toString('hex'));
        var gasPrice = await web3.eth.getGasPrice();

        var rawTx = {
            nonce: parseInt(transactionCount),
            gasPrice: parseInt(gasPrice),
            gasLimit: parseInt(estimatedGas),
            to: Constant.ENV.ContractAddress,
            value: 0,
            data: data
        }
        var tx = new Tx(rawTx);
        tx.sign(this.walletAccount.getPrivateKey());
        var serializedTx = tx.serialize();

        this.updatePendingTx(this.numPendingTx+1);
        web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).on('receipt', (error, result) => {
            this.updatePendingTx(this.numPendingTx-1);
            if (error) {
                console.log(error);
            } else {
                console.log(result);
            }
        });
        return '0x' + tx.hash().toString('hex');
    }

    updatePendingTx(numPendingTx) {
        this.numPendingTx = numPendingTx;
        appDispatcher.dispatch({
            action: Constant.EVENT.PENDING_TRANSACTION_UPDATED
        });
    }

    getContactList = async () => {
        
    }

    getPendingInvitation = async () => {

    }
}

export default Account;