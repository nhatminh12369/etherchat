// Copyright (c) 2018 Nguyen Vu Nhat Minh
// Distributed under the MIT software license, see the accompanying file LICENSE

import { sha256 } from 'ethereumjs-util';

import Wallet from 'ethereumjs-wallet';
import crypto from 'crypto';
import web3 from '../ethereum/web3';
import utils from '../support/Utils';
import EventHandler from './EventHandler';
import appDispatcher from '../core/AppDispatcher';
import TransactionManager from './TransactionManager';
import Constant from '../support/Constant';
import Config from '../support/Config';

class AccountManager {
    constructor(storageManager) {
        this.isJoined = false;
        this.balance = 0;
        this.name = "";
        this.avatarUrl = "";
        this.storageManager = storageManager;
        this.loadPrivateKey();
        this.loadInfoFromstorageManager();
    }

    loadInfoFromstorageManager = () => {
        this.balance = this.storageManager.getBalance();
        this.name = this.storageManager.getName();
        this.avatarUrl = this.storageManager.getAvatarUrl();
        this.isJoined = this.storageManager.getJoinedStatus();
        this.askForTransactionApproval = this.storageManager.getAskForTransactionApproval();
    }

    setProfile = (name, avatarUrl, isJoined) => {
        this.name = name;
        this.avatarUrl = avatarUrl;
        this.isJoined = isJoined;
    }

    // Update balance of the current account
    updateBalance = async () => {
        this.balance = await web3.eth.getBalance(this.walletAccount.getAddress().toString('hex'));
        this.storageManager.setBalance(this.balance);
        appDispatcher.dispatch({
            action: Constant.EVENT.ACCOUNT_BALANCE_UPDATED
        })
    }

    setAskForTransactionApproval = (askForApproval) => {
        this.storageManager.setAskForTransactionApproval(askForApproval);
        this.askForTransactionApproval = askForApproval;
    }

    // Load private key from browser's local storage
    loadPrivateKey = () => {
        var privateKeyHex = this.storageManager.getPrivateKey();
        if (privateKeyHex) {
            var privateKeyBuffer = Buffer.from(privateKeyHex, 'hex');
            this.walletAccount = Wallet.fromPrivateKey(privateKeyBuffer);
            this.updateBalance();
        }
    }

    storePrivateKey = (privateKey) => {
        var isValid = false;
        try {
            var privateKeyBuffer = Buffer.from(privateKey, 'hex');
            this.walletAccount = Wallet.fromPrivateKey(privateKeyBuffer);
            this.storageManager.storePrivateKeyAndAddress(privateKey, this.getAddress());
            isValid = true;
        } catch (err) {
        }
        this.updateBalance();
        return isValid;
    }

    getPublicKeyBuffer() {
        return this.walletAccount.getPublicKey();
    }

    getPrivateKeyBuffer() {
        return this.walletAccount.getPrivateKey();
    }

    getAddress = () => {
        if (this.walletAccount) {
            return '0x' + this.walletAccount.getAddress().toString('hex');
        } else {
            return "";
        }
    }

    // Compute a secret key for messages encryption/decryption
    computeSecret = (publicKeyBuffer) => {
        var a = crypto.createECDH('secp256k1');
        a.generateKeys();
        a.setPrivateKey(this.getPrivateKeyBuffer());
        return a.computeSecret(publicKeyBuffer);
    }
}

export default AccountManager;