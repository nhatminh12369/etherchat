// Copyright (c) 2018 Nguyen Vu Nhat Minh
// Distributed under the MIT software license, see the accompanying file LICENSE

import {Component} from 'react';
import {
    Modal,
    Header,
    Button,
    Message,
    Checkbox
} from 'semantic-ui-react';
import appDispatcher from '../../core/AppDispatcher';
import Constant from '../../support/Constant';

class SettingsModal extends Component {
    constructor(props) {
        super(props);
        this.account = props.account;
        this.state = { modalOpen: false, askForApproval: false}
    }

    handleClose = (e) => {
        e.preventDefault();
        this.setState({ modalOpen: false})
    };

    handleUpdate = () => {
        this.account.setAskForTransactionApproval(this.state.askForApproval);
        this.setState({ modalOpen: false})
    }

    componentDidMount() {
        appDispatcher.register((payload) => {
            if (payload.action == Constant.ACTION.OPEN_SETTINGS_MODAL) {
                var askForApproval = this.account.askForTransactionApproval;
                this.setState({modalOpen: true, askForApproval});
            }
        });
    }

    render() {
        return (
            <Modal
                open={this.state.modalOpen}
                onClose={this.handleClose}
                size='small'
                >
                <Header icon="" content='Settings' />
                    <Modal.Content>
                        <Checkbox toggle label='Ask for transaction approval' checked={this.state.askForApproval} onChange={(event, data) => this.setState({askForApproval: data.checked})}/>
                    </Modal.Content>
                    <Modal.Actions>
                    <Button color='blue' onClick={this.handleUpdate}>
                        Update
                    </Button>
                    <Button color='grey' onClick={this.handleClose}>
                        Close
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
}

export default SettingsModal;