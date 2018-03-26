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

class HeaderMenu extends Component {
    constructor(props) {
        super(props);
        this.account = props.account;
        this.state = {address: "", balance: "", network: 4};
    }

    clearAllData = () => {
        window.localStorage.clear();
    }

    joinContract = () => {
        this.account.joinContract();
    }

    componentDidMount() {
        this.getAccountInfo();
    }

    getAccountInfo = () => {
        if (this.account.isValid) {
            var balance = parseFloat(web3.utils.fromWei(this.account.balance, 'ether')).toFixed(6);
            this.setState({address: this.account.getAddress(), balance: balance});
        } else {
            setTimeout(this.getAccountInfo, 800);
        }
    }

    handleDropdownClicked = (event, data) => {
        if (data.name == 'changeNameItem') {

        } else if (data.name == 'changeAvatarItem') {

        } else if (data.name == 'logOutItem') {
            this.clearAllData();
        }
    }

    render() {
        var accountInfo = (<Loader active />);
        var dropdownTrigger = (
            <span><Icon name='user' size='large'/>{this.state.address.substr(0,10)}</span>
        );
        if (this.state.address != "") {
            accountInfo = (
                <Menu.Menu position='right'>
                    <Menu.Item>
                        <List>
                        <List.Item>{this.state.address}</List.Item>
                        <List.Item>
                            Balance: <Label color='orange'>{this.state.balance + ' ETH' }</Label>
                            {/* <Button onClick={this.clearPrivateKey} color='red' style={{fontSize: '0.9em', float: 'right'}}>Logout</Button> */}
                        </List.Item>
                        </List>
                    </Menu.Item>
                    <Menu.Item>
                        <Dropdown item trigger={dropdownTrigger}>
                            <Dropdown.Menu>
                                <Dropdown.Item name='changeNameItem' onClick={this.handleDropdownClicked}>
                                    <Icon name='write'/>Change name
                                </Dropdown.Item>
                                <Dropdown.Item name='changeAvatarItem' onClick={this.handleDropdownClicked}>
                                    <Icon name='write'/>Change avatar
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