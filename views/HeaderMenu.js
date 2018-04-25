// Copyright (c) 2018 Nguyen Vu Nhat Minh
// Distributed under the MIT software license, see the accompanying file LICENSE

import {Component} from 'react';
import {
    Menu,
    Container,
    Button,
    Label,
    Loader,
    List,
    Image,
    Icon,
    Dropdown
} from 'semantic-ui-react';
import Head from 'next/head';
import web3 from '../ethereum/web3';
import Constant from '../support/Constant';
import Config from '../support/Config';
import appDispatcher from '../core/AppDispatcher';

class HeaderMenu extends Component {
    constructor(props) {
        super(props);
        this.account = props.account;
        this.contractManager = props.contractManager;
        this.transactionDispatcher = props.transactionDispatcher;
        this.state = {address: "", balance: "", name: "", 
            avatarUrl: "", isLoading: true, isJoinButtonLoading: false, 
            isJoined: false, numPendingTx: 0};
        this.reloadCount = 0;
    }

    clearAllData = () => {
        window.localStorage.clear();
    }

    componentDidMount() {
        if (this.account) {
            this.getAccountInfo();
            appDispatcher.register((payload) => {
                if (payload.action == Constant.EVENT.ACCOUNT_BALANCE_UPDATED) {
                    this.setState({balance: this.account.balance});
                } else if (payload.action == Constant.EVENT.ACCOUNT_INFO_UPDATED) {
                    this.setState({name: payload.profile.name, avatarUrl: payload.profile.avatarUrl, isJoined: payload.profile.isJoined});
                } 
            });
            this.transactionDispatcher.register((payload) => {
                if (payload.action == Constant.EVENT.PENDING_TRANSACTION_UPDATED) {
                    this.setState({numPendingTx: payload.numPendingTx});
                }
            });
        }
    }

    getAccountInfo = () => {
        var address = this.account.getAddress();
        if (address) {
            this.setState({address: address, balance: this.account.balance, isLoading: false, isJoined: this.account.isJoined});
        } else {
            if (this.reloadCount == 1) {
                this.setState({isLoading: false});
            } else {
                this.reloadCount++;
                setTimeout(this.getAccountInfo, 800);
            }
        }
    }

    handleDropdownClicked = (event, data) => {
        if (data.name == 'updateProfile') {
            appDispatcher.dispatch({
                action: Constant.ACTION.OPEN_UPDATE_PROFILE
            });
        } else if (data.name == 'logOutItem') {
            this.clearAllData();
            window.location.reload();
        } else if (data.name == 'settingsItem') {
            appDispatcher.dispatch({
                action: Constant.ACTION.OPEN_SETTINGS_MODAL
            })
        } 
         else if (data.name == 'changeEthNetwork') {
            if (data.networkid != Config.ENV.EthNetworkId) {
                Config.ENV.EthNetworkId = data.networkid;
                this.removeNetworkDependentData();
                window.location.reload();
            }
        }
    }

    removeNetworkDependentData = () => {
        this.account.storageManager.removeNetworkDependentData();
    }

    handleJoinClicked = () => {
        var publicKeyBuffer = this.account.getPublicKeyBuffer();
        this.contractManager.joinContract(publicKeyBuffer, (resultEvent) => {
            if (resultEvent == Constant.EVENT.ON_REJECTED || resultEvent == Constant.EVENT.ON_ERROR) {
                this.setState({isJoinButtonLoading: false});
            } else if (resultEvent == Constant.EVENT.ON_RECEIPT) {
                window.location.reload();
            }
        });
        this.setState({isJoinButtonLoading: true});
    }

    handleImportPrivateKeyClicked = () => {
        appDispatcher.dispatch({
            action: Constant.ACTION.OPEN_PRIVATE_KEY_MODAL
        });
    }

    render() {
        var accountInfo = (<div></div>);

        if (this.account) {
            if (this.state.isLoading == false) {
                if (this.state.address) {
                    var addressExplorerUrl = Config.ENV.ExplorerUrl + 'address/' + this.state.address;
                    var dropdownTrigger;

                    if (this.state.avatarUrl) { 
                        dropdownTrigger = (
                            <span><Image src={this.state.avatarUrl} avatar/>{ this.state.name ? this.state.name : this.state.address.substr(0,10)}</span>
                        );
                    } else {
                        dropdownTrigger = (
                            <span><Icon name='user' size='large'/>{ this.state.name ? this.state.name : this.state.address.substr(0,10)}</span>
                        );
                    }

                    var networkItems = [];
                    for (var i=0;i<Config.NETWORK_LIST.length;i++) {
                        networkItems.push(
                            <Dropdown.Item key={'networkItem' + i} networkid={Config.NETWORK_LIST[i].id} name='changeEthNetwork' onClick={this.handleDropdownClicked}>
                                {Config.NETWORK_LIST[i].name}
                            </Dropdown.Item>
                        );
                    }

                    var memberInfo;
                    if (this.account.isJoined) {
                        memberInfo = (
                            <Dropdown item trigger={dropdownTrigger}>
                                <Dropdown.Menu>
                                    <Dropdown.Item name='updateProfile' onClick={this.handleDropdownClicked}>
                                        <Icon name='write'/>Update profile
                                    </Dropdown.Item>
                                    <Dropdown.Item name='settingsItem' onClick={this.handleDropdownClicked}>
                                        <Icon name='settings'/>Settings
                                    </Dropdown.Item>
                                    <Dropdown.Item name='logOutItem' onClick={this.handleDropdownClicked}>
                                        <Icon name='log out'/>Log out
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        );
                    } else {
                        memberInfo = (
                            <Button color='orange' onClick={this.handleJoinClicked} 
                                loading={this.state.isJoinButtonLoading} 
                                disabled={this.state.isJoinButtonLoading}>Join {Constant.APP_NAME}</Button>
                        );
                    }

                    var pendingTxItem;
                    if (this.state.numPendingTx > 0) {
                        pendingTxItem = (
                            <Label as='a' color='yellow' href={addressExplorerUrl} target='_blank'>
                                <Icon name='spinner' loading/>
                                {this.state.numPendingTx} pending tx
                            </Label>
                        );
                    }

                    accountInfo = (
                        <Menu.Menu position='right'>
                            <Menu.Item>
                            <Dropdown item text={Config.ENV.NetworkName}>
                                    <Dropdown.Menu>
                                        {networkItems}
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Menu.Item>
                            <Menu.Item>
                                <List>
                                <List.Item>
                                    <a href={addressExplorerUrl} target='_blank'>
                                        {this.state.address}
                                    </a>
                                </List.Item>
                                <List.Item>
                                    Balance: <Label as='a' href={addressExplorerUrl} target='_blank' color='orange'>{parseFloat(web3.utils.fromWei("" +this.state.balance, 'ether')).toFixed(8) + ' ETH' }</Label>
                                    {pendingTxItem}
                                </List.Item>
                                </List>
                            </Menu.Item>
                            <Menu.Item>
                                {memberInfo}
                            </Menu.Item>
                        </Menu.Menu>
                    );
                } else {
                    accountInfo = (
                        <Menu.Menu position='right'>
                            <Menu.Item>
                                <Button onClick={this.handleImportPrivateKeyClicked} color='blue'>Import private key</Button>
                            </Menu.Item>
                        </Menu.Menu>
                    );
                }
            } else {
                accountInfo = (<Loader inverted active />);
            }
        }

        return (
            <Menu fixed='top' color='teal' inverted>
                <Head>
                <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.12/semantic.min.css"></link>
                </Head>
                <Container>
                <Menu.Item>
                    <a href='/'><Image src='static/images/logo_small.png' height={44} /></a>
                </Menu.Item>
                    {this.account ? accountInfo: (<div></div>)}
                </Container>
            </Menu>
        );
    }
}

export default HeaderMenu;