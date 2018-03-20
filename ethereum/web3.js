import Web3 from 'web3';

const provider = new Web3.providers.HttpProvider('https://rinkeby.infura.io/Q2aBIgYNhIB60VsqyrN1');
let web3 = new Web3(provider);

export default web3;