// Copyright (c) 2018 Nguyen Vu Nhat Minh
// Distributed under the MIT software license, see the accompanying file LICENSE

import {Component} from 'react';
import {
    Button,
    Container,
    List,
    Image,
    Grid,
    Message,
    Rail,
    Sticky,
    Input,
    Segment
} from 'semantic-ui-react';
import HeaderMenu from '../views/HeaderMenu';
import web3 from '../ethereum/web3';
import PrivateKeyModal from '../views/modals/EnterPrivateKeyModal';
import UpdateProfileModal from '../views/modals/UpdateProfileModal';
import GuideModal from '../views/modals/GuideModal';
import Head from 'next/head';
import AccountManager from '../core/AccountManager';
import ContactList from '../views/ContactList';
import Chat from '../views/Chat';
import ErrorModal from '../views/modals/ErrorModal';
import SettingsModal from '../views/modals/SettingsModal';
import TransactionModal from '../views/modals/TransactionModal';
import Footer from '../views/Footer';

class Index extends Component {
    constructor(props) {
        super(props);
        this.state = { width: 0, height: 0, contactList: [], messages: [], selectedContact: "" };
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
        this.account = new AccountManager();
    }

    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
        this.account.loadPrivateKey();
    }
      
    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }
      
    updateWindowDimensions() {
        this.setState({ width: window.innerWidth, height: window.innerHeight });
    }

    joinIntoContract = () => {
        this.account.joinContract();
    }

    render() {
        var account = this.account;

        var listHeight = this.state.height - 140;
        return (
            <Container>
                <Head>
                    <title>EtherChat - Decentralized messaging on Ethereum network</title>
                </Head>

                <UpdateProfileModal account={account} />
                <PrivateKeyModal account={account} />
                <HeaderMenu account={account} />
                <GuideModal />
                <ErrorModal />
                <SettingsModal account={account} />
                <TransactionModal account={account} />
            <Grid column={2} style={{paddingTop: 100}}>
                <Grid.Row stretched>
                    <Grid.Column width={6} style={{height: listHeight + "px", float: 'left'}}>
                        <ContactList height={listHeight} account={account}/>
                    </Grid.Column>
                    <Grid.Column width={10} style={{height: listHeight + "px", overflow: 'auto', float: 'left'}}>
                        <Chat height={listHeight} account={account}/>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
            <Footer />
            </Container>
        );
    }
}

export default Index;