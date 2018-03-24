import {Component} from 'react';
import {
    Menu,
    Container,
    Button,
    Label,
    Loader,
    List
} from 'semantic-ui-react';
import Head from 'next/head';
import web3 from '../ethereum/web3';

class HeaderMenu extends Component {
    constructor(props) {
        super(props);
        this.account = props.account;
        this.state = {address: "", balance: "", network: 4};
    }

    clearPrivateKey = () => {
        window.localStorage.removeItem("privateKey");
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

    

    render() {
        // var account = this.account;
        // console.log(account);

        // var content;
        // if (this.account.isValid == false) {
        //     content = (
        //         <Button primary>Create account</Button>
        //     );
        // } else if (this.account.isJoined == false) {
        //     content = (
        //         <Menu.Item position='right'>
        //             {this.account.getAddress()}<br />
        //             { parseFloat(web3.utils.fromWei(this.account.balance, 'ether')).toFixed(6) }
        //         </Menu.Item>
        //         <Menu.Item position='right'>
        //             <Button primary>Join zzz</Button>
        //             <Button onClick={this.clearPrivateKey} primary>Clear</Button>
        //         </Menu.Item>
        //     );
        // } else {
        //     content = (
        //         <div>
        //         {this.account.getAddress()}<br />
        //         {this.account.getBalance()}
        //         <Button onClick={this.clearPrivateKey} primary>Clear</Button>
        //         </div>
        //     );
        // }
        // return content;

        var accountInfo = (<Loader active />);
        if (this.state.address != "") {
            accountInfo = (
                <Menu.Item>
                    <List>
                    <List.Item>{this.state.address.substr(0,14) + '...'}</List.Item>
                    <List.Item><Label color='green'>{this.state.balance + ' ETH' }</Label></List.Item>
                    </List>
                </Menu.Item>
            );
        }

        return (
            <Menu fixed='top'>
                <Head>
                <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.12/semantic.min.css"></link>
                </Head>
                <Container>
                <Menu.Item>Project name</Menu.Item>
                <Menu.Item>About zzz</Menu.Item>
                <Menu.Menu position='right'>
                    {accountInfo}
                    <Menu.Item>
                        <Button primary>Join zzz</Button>
                        <Button onClick={this.clearPrivateKey} primary>Clear</Button>
                    </Menu.Item>
                </Menu.Menu>
                </Container>
            </Menu>
        );
    }
}

export default HeaderMenu;