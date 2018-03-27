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
import Constant from './Constant';
import appDispatcher from './AppDispatcher';

class HeaderMenu extends Component {
    constructor(props) {
        super(props);
        this.account = props.account;
        this.state = {address: "", balance: "", name: "", avatarUrl: ""};
    }

    clearAllData = () => {
        window.localStorage.clear();
    }

    joinContract = () => {
        this.account.joinContract();
    }

    componentDidMount() {
        this.getAccountInfo();
        appDispatcher.register((payload) => {
            if (payload.action == Constant.EVENT.ACCOUNT_BALANCE_UPDATED) {
                this.setState({balance: this.account.balance});
            } else if (payload.action == Constant.EVENT.ACCOUNT_INFO_UPDATED) {
                this.setState({name: this.account.name, avatarUrl: this.account.avatarUrl});
            }
        })
    }

    getAccountInfo = () => {
        if (this.account.isValid) {
            this.setState({address: this.account.getAddress(), balance: this.account.balance});
        } else {
            setTimeout(this.getAccountInfo, 800);
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
        } else if (data.name == 'changeEthNetwork') {
            if (data.networkid != Constant.ENV.EthNetworkId) {
                Constant.ENV.EthNetworkId = data.networkid;
                this.removeNetworkDependentData();
                window.location.reload();
            }
        }
    }

    removeNetworkDependentData() {
        this.account.storageManager.removeNetworkDependentData();
    }

    render() {
        var accountInfo = (<Loader active />);
        var dropdownTrigger;
        if (this.state.avatarUrl) { 
            dropdownTrigger = (
                <span><Icon src={this.state.avatarUrl} size='large'/>{ this.state.name ? this.state.name : this.state.address.substr(0,10)}</span>
            );
        } else {
            dropdownTrigger = (
                <span><Icon name='user' size='large'/>{ this.state.name ? this.state.name : this.state.address.substr(0,10)}</span>
            );
        }
        if (this.state.address != "") {
            var networkItems = [];
            for (var i=0;i<Constant.NETWORK_LIST.length;i++) {
                networkItems.push(
                    <Dropdown.Item key={'networkItem' + i} networkid={Constant.NETWORK_LIST[i].id} name='changeEthNetwork' onClick={this.handleDropdownClicked}>
                        {Constant.NETWORK_LIST[i].name}
                    </Dropdown.Item>
                );
            }
            accountInfo = (
                <Menu.Menu position='right'>
                    <Menu.Item>
                    <Dropdown item text={Constant.ENV.NetworkName}>
                            <Dropdown.Menu>
                                {networkItems}
                            </Dropdown.Menu>
                        </Dropdown>
                    </Menu.Item>
                    <Menu.Item>
                        <List>
                        <List.Item>{this.state.address}</List.Item>
                        <List.Item>
                            Balance: <Label color='orange'>{parseFloat(web3.utils.fromWei("" +this.state.balance, 'ether')).toFixed(8) + ' ETH' }</Label>
                        </List.Item>
                        </List>
                    </Menu.Item>
                    <Menu.Item>
                        <Dropdown item trigger={dropdownTrigger}>
                            <Dropdown.Menu>
                                <Dropdown.Item name='updateProfile' onClick={this.handleDropdownClicked}>
                                    <Icon name='write'/>Update profile
                                </Dropdown.Item>
                                <Dropdown.Item name='logOutItem' onClick={this.handleDropdownClicked}>
                                    <Icon name='log out'/>Log out
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Menu.Item>
                </Menu.Menu>
            );
        }

        return (
            <Menu fixed='top' color='teal' inverted>
                <Head>
                <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.12/semantic.min.css"></link>
                </Head>
                <Container>
                <Menu.Item>Project name</Menu.Item>
                <Menu.Item>About zzz</Menu.Item>
                    {accountInfo}
                </Container>
            </Menu>
        );
    }
}

export default HeaderMenu;