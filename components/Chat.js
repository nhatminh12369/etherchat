import {Component} from 'react';
import {
    Segment,
    Input,
    Button,
    Message,
    Icon
} from 'semantic-ui-react';
import appDispatcher from '../components/AppDispatcher';
import Constant from '../components/Constant';
import utils from '../lib/Utils';

class Chat extends Component {
    constructor(props) {
        super(props);
        this.account = props.account;
        this.state = {address: "", composedMessage: "", messages: [], publicKey: ""}
    }

    componentDidMount() {
        this.scrollToBottom();
      }
    
      componentDidUpdate() {
        this.scrollToBottom();
      }
    
      scrollToBottom() {
          if (this.lastObjectAnchor != undefined) {
                this.lastObjectAnchor.scrollIntoView({ behavior: 'smooth' });
          }
      }    

    componentDidMount() {
        appDispatcher.register((payload) => {
            if (payload.action == Constant.ACTION.SELECT_CONTACT) {
                this.setState({address: payload.data, 
                    publicKey: this.account.storageManager.contacts[payload.data].publicKey,
                    messages: this.account.storageManager.contacts[payload.data].messages});
            }
            if (this.state.address != "" && payload.action == Constant.EVENT.MESSAGES_UPDATED) {
                if (payload.data == undefined || payload.data == this.state.address) {
                    this.setState({messages: this.account.storageManager.contacts[this.state.address].messages})
                }
            }
        })
    }

    sendMessage = () => {
        this.account.sendMessage(this.state.address, this.state.composedMessage);
        this.setState({composedMessage: ""});
    }

    render() {
        const {height} = this.props;

        const { publicKey, messages} = this.state;

        var messageItems = [];
        if (publicKey) {
            for (var i=0;i<messages.length;i++) {
                var decryptedMessage;
                if (messages[i].encryption == 'aes256') {
                    decryptedMessage = utils.decrypt(messages[i].message.substr(2), 
                        this.account.computeSecret(Buffer.from(publicKey, 'hex')));
                } else {
                    decryptedMessage = messages[i].message;
                }
                var lastObjectAnchor = (<div />);
                if (i == messages.length - 1) {
                    lastObjectAnchor = (<div ref={lastObjectAnchor => { this.lastObjectAnchor = lastObjectAnchor; }} />);
                }

                if (messages[i].isMine) {
                    if (messages[i].isPending == true) {
                        messageItems.push(
                            <Message negative key={'msg_' + i}>
                                <Icon name='circle notched' loading />
                                {decryptedMessage}
                                {lastObjectAnchor}
                            </Message>
                        );
                    } else {
                        messageItems.push(
                            <Message negative key={'msg_' + i}>
                                {decryptedMessage}
                                {lastObjectAnchor}
                            </Message>
                        );
                    }
                } else {
                    messageItems.push(
                        <Message info key={'msg_' + i}>
                        {decryptedMessage}
                        {lastObjectAnchor}
                        </Message>
                    );
                }
            }
        }

        return (
            <div style={{width: '100%'}}>
                <Segment style={{height: (height-90) + "px", width: '100%', overflow: 'auto'}}>
                    {messageItems}
                </Segment>
                <Segment>
                    <Input style={{width: '70%'}} 
                        value={this.state.composedMessage} 
                        onChange={(e) => this.setState({composedMessage: e.target.value})} 
                        action={{ color: 'teal', labelPosition: 'right', icon: 'send', content: 'Send', onClick: (e)=>this.sendMessage()}}/>
                    <Button>Test</Button>
                </Segment>
            </div>
        );
    }
}

export default Chat;