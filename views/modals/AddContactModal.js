// Copyright (c) 2018 Nguyen Vu Nhat Minh
// Distributed under the MIT software license, see the accompanying file LICENSE

import {Component} from 'react';
import web3 from '../../ethereum/web3';
import {
    Modal,
    Input,
    Message,
    Button,
    Icon,
    Header
} from 'semantic-ui-react';
import appDispatcher from '../../core/AppDispatcher';
import Constant from '../../support/Constant';

class AddContactModal extends Component {
    constructor(props) {
        super(props);
        this.state = { modalOpen: false, errorMessage: "", address: ""}
        this.contractManager = props.contractManager;
    }
    
    componentWillMount() {
        appDispatcher.register((payload) => {
            if (payload.action == Constant.ACTION.ADD_CONTACT) {
                this.setState({modalOpen: true, errorMessage: "", isLoading: false, address: ""});
            }
        })
    }

    handleClose = (e) => {
        e.preventDefault();
        this.setState({errorMessage: ""});
        this.setState({ modalOpen: false })
    };

    handleAddContact = (e) => {
        if (web3.utils.isAddress(this.state.address)) {
            this.contractManager.addContact(this.state.address);
            this.setState({errorMessage: "", modalOpen: false});
        } else {
            this.setState({errorMessage: "Invalid ethereum address"});
        }
    }

    render() {
        return (
            <Modal
                open={this.state.modalOpen}
                onClose={this.handleClose}
                size='small'
                >
                <Header icon="" content="Add contact by address" />
                    <Modal.Content>
                        <Input fluid value={this.state.address} onChange={event => this.setState({address: event.target.value})}/>
                        <Message error header={this.state.errorMessage} hidden={this.state.errorMessage == ""}/>
                    </Modal.Content>
                    <Modal.Actions>
                    <Button color='orange' onClick={this.handleAddContact}>
                        <Icon name='checkmark' /> Add
                    </Button>
                    <Button color='grey' onClick={this.handleClose}>
                        <Icon name='close' /> Close
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
}

export default AddContactModal;