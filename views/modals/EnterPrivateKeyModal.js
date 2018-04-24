// Copyright (c) 2018 Nguyen Vu Nhat Minh
// Distributed under the MIT software license, see the accompanying file LICENSE

import {Component} from 'react';
import {
    Modal,
    Header,
    Button,
    Icon,
    Input,
    Message
} from 'semantic-ui-react';
import appDispatcher from '../../core/AppDispatcher';
import Constant from '../../support/Constant';

class EnterPrivateKeyModal extends Component {
    constructor(props) {
        super(props);
        this.state = { modalOpen: false, key: "", errorMessage:""}
        this.account = props.account;
    }

    handleClose = (e) => {
        e.preventDefault();
        this.setState({errorMessage: ""});
        this.setState({ modalOpen: false })
    };

    handleConfirm = (e) => {
        e.preventDefault();
        this.setState({errorMessage: ""});

        var success = this.account.storePrivateKey(this.state.key);
        if (success) {
            this.setState({ modalOpen: false });
            window.location.reload();
        } else {
            this.setState({errorMessage: "Invalid private key"});
        }
        
    };

    componentWillMount() {
        appDispatcher.register((payload) => {
            if (payload.action == Constant.ACTION.OPEN_PRIVATE_KEY_MODAL) {
                this.setState({modalOpen: true});
            }
        })
    }

    render() {
        return (
            <Modal
                open={this.state.modalOpen}
                onClose={this.handleClose}
                size='small'
                >
                <Header icon="" content="Import private key"/>
                    <Modal.Content>
                        <Input fluid value={this.state.key} 
                            onChange={event => this.setState({key: event.target.value})}
                            placeholder='Ethereum private key'/>
                        <Message error header={this.state.errorMessage} hidden={this.state.errorMessage == ""}/>
                        <p style={{marginTop: 20}}>By clicking Confirm, you also agree to our <a href='/terms' target='_blank'>Terms of use</a></p>
                    </Modal.Content>
                    <Modal.Actions>
                    <Button color='blue' onClick={this.handleConfirm}>
                        <Icon name='checkmark' /> Confirm
                    </Button>
                    <Button color='grey' onClick={this.handleClose}>
                        <Icon name='close' /> Close
                    </Button>
                    </Modal.Actions>
                </Modal>
        );
    }
}

export default EnterPrivateKeyModal;