// Copyright (c) 2018 Nguyen Vu Nhat Minh
// Distributed under the MIT software license, see the accompanying file LICENSE

import EventEmitter from 'events';
import Constant from '../support/Constant';
import Config from '../support/Config';
import {Dispatcher} from 'flux';
import web3 from '../ethereum/web3';
import Tx from 'ethereumjs-tx';

class TransactionsManager {
    constructor(account) {
        this.account = account;
        this.numPendingTx = 0;      // Number of pending Ethereum transactions
        this.emitterMapping = {};   // A mapping of an increamental id with an event emitter in order
                                    // to emit user approval and transaction results.

        this.emitterIncrementalId = 0; // will be increased everytime executeMethod get called
        this.dispatcher = new Dispatcher();

        this.dispatcher.register((payload) => {
            if (payload.action == Constant.ACTION.APPROVE_TRANSACTION) {
                this.approveTransaction(payload.transactionId, payload.gasPrice, payload.gasAmount, payload.method);
            } else if (payload.action == Constant.ACTION.REJECT_TRANSACTION) {
                this.rejectTransaction(payload.transactionId);
            }
        })
    }

    /**
     * @description Get called when user click on Approve button from a TransactionModal
     */
    approveTransaction = async (transactionId, gasPrice, gasAmount, method) => {
        var emitter = this.emitterMapping[transactionId];

        var data = method.encodeABI();
        var transactionCount = await web3.eth.getTransactionCount(this.account.getAddress());

        var rawTx = {
            nonce: parseInt(transactionCount + this.numPendingTx),
            gasPrice: parseInt(gasPrice),
            gasLimit: parseInt(gasAmount),
            to: Config.ENV.ContractAddress,
            value: 0,
            data: data
        }
        var tx = new Tx(rawTx);
        tx.sign(this.account.getPrivateKeyBuffer());
        var serializedTx = tx.serialize();
        var txHash =  '0x' + tx.hash().toString('hex');

        this.updatePendingTx(this.numPendingTx+1);
        web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
                .on('receipt', (receipt) => {
                    this.updatePendingTx(this.numPendingTx-1);
                    emitter.emit(Constant.EVENT.ON_RECEIPT, receipt);
                }).on('error', (err, data) => {
                    this.updatePendingTx(this.numPendingTx-1);
                    emitter.emit(Constant.EVENT.ON_ERROR, err, txHash);
                });
        emitter.emit(Constant.EVENT.ON_APPROVED, txHash);
    }

    /**
     * @description Get called when user click on Approve button from a TransactionModal
     */
    rejectTransaction = (transactionId) => {
        var emitter = this.emitterMapping[transactionId];
        emitter.emit(Constant.EVENT.ON_REJECTED);

        delete this.emitterMapping[transactionId];
    }

    updatePendingTx(numPendingTx) {
        this.numPendingTx = numPendingTx;
        this.dispatcher.dispatch({
            action: Constant.EVENT.PENDING_TRANSACTION_UPDATED,
            numPendingTx: this.numPendingTx
        });
    }

    /**
     * @description Execute a web3's method by signing and sending the raw transaction to EtherChat contract.
     * @param {*} method Web3 contract method instance, which contains method's parameters.
     */
    executeMethod(method) {
        this.emitterIncrementalId++;
        var emitter = new EventEmitter();
        this.emitterMapping[this.emitterIncrementalId] = emitter;

        if (this.account.askForTransactionApproval) {
            this.dispatcher.dispatch({
                action: Constant.ACTION.OPEN_TRANSACTION_MODAL,
                method: method,
                transactionId: this.emitterIncrementalId
            });
        } else {
            this.automaticallyApproveTransaction(this.emitterIncrementalId, method);
        }

        return emitter;
    }

    /**
     * @description Approve a transaction without asking for user permission. Gas price will be
     * calculated automatically
     */
    automaticallyApproveTransaction = async (transactionId, method) => {
        var estimatedGas;
        try {
            estimatedGas = await method.estimateGas({
                gas: 3000000,
            });
        } catch(err) {
            estimatedGas = 3000000;
        }
        var gasPrice = await web3.eth.getGasPrice();
        this.approveTransaction(transactionId, gasPrice, estimatedGas, method);
    }
}

export default TransactionsManager;