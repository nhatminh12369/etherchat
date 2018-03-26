import {Component} from 'react';
import {
    Segment,
    Input,
    Button,
    Message
} from 'semantic-ui-react';
import appDispatcher from '../components/AppDispatcher';
import Constant from '../components/Constant';

class Chat extends Component {
    constructor(props) {
        super(props);
        this.account = props.account;
        this.state = {address: "", composedMessage: ""}
    }

    componentDidMount() {
        appDispatcher.register((payload) => {
            if (payload.action == Constant.ACTION.SELECT_CONTACT) {
                this.setState({address: payload.data});
            }
        })
    }

    sendMessage = () => {
        this.account.sendMessage(this.state.address, this.state.composedMessage);
    }

    render() {
        const {height} = this.props;

        var messageItems = [];
        for (var i=0;i<30;i++) {
            messageItems.push(
                <Message info key={'msg_' + i}>
                <p>test message</p>
                </Message>
            );
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