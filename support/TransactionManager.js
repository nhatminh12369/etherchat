import EventEmitter from 'events';
import Constant from './Constant';
import {Dispatcher} from 'flux';

class TransactionsManager {
    constructor() {
        this.numPendingTx = 0;
        this.emitterMapping = {};
        this.emitterIncrementalId = 0;
        this.dispatcher = new Dispatcher();

        this.dispatcher.register((payload) => {
            if (payload.action == Constant.ACTION.APPROVE_TRANSACTION) {
                this.approveTransaction(payload.transactionId, payload.gasPrice, payload.method);
            } else if (payload.action == Constant.ACTION.REJECT_TRANSACTION) {
                this.rejectTransaction(payload.transactionId);
            }
        })
    }

    approveTransaction = (transactionId, gasPrice, method) => {
        var emitter = this.emitterMapping[transactionId];

        // var data = method.encodeABI();
        // var estimatedGas;
        // try {
        //     estimatedGas = await method.estimateGas({
        //         gas: 3000000,
        //         from: this.getAddress()
        //     });
        // } catch(err) {
        //     appDispatcher.dispatch({
        //         action: Constant.EVENT.ENCOUNTERED_ERROR,
        //         message: err.message,
        //         title: "Opps!!"
        //     });
        //     return "";
        // }
        // var transactionCount = await web3.eth.getTransactionCount(this.walletAccount.getAddress().toString('hex'));
        // var gasPrice = await web3.eth.getGasPrice();

        // var rawTx = {
        //     nonce: parseInt(transactionCount + this.numPendingTx),
        //     gasPrice: parseInt(gasPrice),
        //     gasLimit: parseInt(estimatedGas),
        //     to: Constant.ENV.ContractAddress,
        //     value: 0,
        //     data: data
        // }
        // var tx = new Tx(rawTx);
        // tx.sign(this.walletAccount.getPrivateKey());
        // var serializedTx = tx.serialize();

        // this.updatePendingTx(this.numPendingTx+1);
        // web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
        //         .on('receipt', (err, result) => {
        //             this.updatePendingTx(this.numPendingTx-1);
        //             if (err) {
        //                 console.log(err);
        //             } else {
        //                 console.log(result);
        //             }
        //         }).on('error', (err) => {
        //             appDispatcher.dispatch({
        //                 action: Constant.EVENT.ENCOUNTERED_ERROR,
        //                 message: err.message,
        //                 title: "Opps!!"
        //             });
        //             this.updatePendingTx(this.numPendingTx-1);
        //         });
        // return '0x' + tx.hash().toString('hex');

        emitter.emit(Constant.EVENT.ON_APPROVED);
    }

    rejectTransaction = (transactionId) => {
        var emitter = this.emitterMapping[transactionId];
        emitter.emit(Constant.EVENT.ON_REJECTED);

        delete this.emitterMapping[transactionId];
    }

    executeMethod(method) {
        this.emitterIncrementalId++;
        var emitter = new EventEmitter();
        this.emitterMapping[this.emitterIncrementalId] = emitter;

        this.dispatcher.dispatch({
            action: Constant.ACTION.OPEN_TRANSACTION_MODAL,
            method: method,
            transactionId: this.emitterIncrementalId
        });

        return emitter;
    }


}

export default TransactionsManager;