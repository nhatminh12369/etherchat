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
import HeaderMenu from '../components/HeaderMenu';
import web3 from '../ethereum/web3';
import PrivateKeyModal from '../components/EnterPrivateKeyModal';
import GuideModal from '../components/GuideModal';
import Head from 'next/head';
import Account from '../lib/Account';
import ContactList from '../components/ContactList';

class Index extends Component {
    constructor(props) {
        super(props);
        this.state = { width: 0, height: 0, contactList: [], messages: [], selectedContact: "" };
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
        this.account = new Account();
    }

    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
        this.checkForPrivateKey();
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

    checkForPrivateKey() {
        if (typeof(Storage) !== "undefined") {
            var privateKey = window.localStorage.privateKey;
            var firstTimeUse = window.localStorage.firstTimeUse;
            if (firstTimeUse) {
                if (privateKey == undefined) {
                    //this.setState({modalOpen: true});
                } else {
                    console.log('Private key: ' + privateKey);
                    this.account.setPrivateKey(privateKey);
                }
            }
        }
    }

    render() {
        var messageItems = [];
        var account = this.account;

        for (var i=0;i<30;i++) {
            messageItems.push(
                <Message info key={'msg_' + i}>
                <p>test message</p>
                </Message>
            );
        }

        var listHeight = this.state.height - 100;
        return (
            <Container>
                <PrivateKeyModal account={account} />
                <HeaderMenu account={account} />
                <GuideModal />
            <Grid column={2} style={{paddingTop: 80}}>
                <Grid.Row stretched>
                    <Grid.Column width={6} style={{height: listHeight + "px", float: 'left'}}>
                        <ContactList height={listHeight} account={account}/>
                    </Grid.Column>
                    <Grid.Column width={10} style={{height: listHeight + "px", overflow: 'auto', float: 'left'}}>
                        <Segment style={{height: (listHeight-40) + "px", overflow: 'auto', float: 'left'}}>
                            {messageItems}
                        </Segment>
                        <Segment inline="true">
                            <Input style={{width: '70%'}} action={{ color: 'teal', labelPosition: 'right', icon: 'send', content: 'Send' }}/>
                            <Button>Test</Button>
                        </Segment>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
            {/* </div> */}
            </Container>
        );
    }
}

export default Index;