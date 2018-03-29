import Web3 from 'web3';
import Constant from '../support/Constant';

let web3;

const provider = new Web3.providers.HttpProvider(Constant.ENV.ProviderUrl);
web3 = new Web3(provider);

// if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {
//     web3 = new Web3(window.web3.currentProvider);
// } else {
//     const provider = new Web3.providers.HttpProvider(Constant.ENV.ProviderUrl);
//     web3 = new Web3(provider);
// }

export default web3;