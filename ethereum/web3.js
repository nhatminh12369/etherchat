import Web3 from 'web3';
import Config from '../support/Config';

let web3;

const provider = new Web3.providers.HttpProvider(Config.ENV.ProviderUrl);
web3 = new Web3(provider);

export default web3;