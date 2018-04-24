// Copyright (c) 2018 Nguyen Vu Nhat Minh
// Distributed under the MIT software license, see the accompanying file LICENSE

import {Component} from 'react';
import {
    Modal,
    Header,
    Button,
    Message,
    Loader,
    Dimmer,
    Form,
    Input
} from 'semantic-ui-react';
import Constant from '../../support/Constant';
import web3 from '../../ethereum/web3';

class TransactionModal extends Component {
    constructor(props) {
        super(props);
        this.dispatcher = props.dispatcher;
        this.state = { modalOpen: false, estimatedGas: 0, gasPrice: 0, transactionId: 0, warningMessage: ""};
    }

    handleReject = (e) => {
        e.preventDefault();
        this.setState({ modalOpen: false})

        this.dispatcher.dispatch({
            action: Constant.ACTION.REJECT_TRANSACTION,
            transactionId: this.state.transactionId
        })
    };

    handleApprove = (e) => {
        e.preventDefault();
        this.setState({ modalOpen: false})

        this.dispatcher.dispatch({
            action: Constant.ACTION.APPROVE_TRANSACTION,
            transactionId: this.state.transactionId,
            method: this.method,
            gasPrice: this.state.gasPrice,
            gasAmount: this.state.estimatedGas
        })
    }

    componentDidMount = () => {
        this.dispatcher.register((payload) => {
            if (payload.action == Constant.ACTION.OPEN_TRANSACTION_MODAL) {
                this.method = payload.method;
                this.setState({modalOpen: true, estimatedGas: 0, gasPrice: 0, transactionId: payload.transactionId});
                this.updateInfo();
            }
        });
    }

    updateInfo = async () => {
        var estimatedGas;
        var warningMessage = "";
        try {
            estimatedGas = await this.method.estimateGas({
                gas: 3000000
                // from: this.account.getAddress()
            });
        } catch(err) {
            estimatedGas = 3000000;
            if (err) {
                warningMessage = err.message;
            }
        }
        var gasPrice = await web3.eth.getGasPrice();
        this.setState({estimatedGas, gasPrice, warningMessage});
    }

    render() {
        var content = (
            <Dimmer.Dimmable as={Modal.Content}>
                <Dimmer active inverted><Loader active inline='centered' inverted /></Dimmer>
            </Dimmer.Dimmable>
        );
        if (this.state.gasPrice) {
            content = (
            <Modal.Content>
                <Form warning={this.state.warningMessage != ""}>
                    <Form.Field>
                    The gas price is suggested by the last few blocks median gas price.
                    </Form.Field>
                    <Form.Field inline>
                    <label>Gas limit: </label>
                    <input value={this.state.estimatedGas} disabled />
                    </Form.Field>
                    <Form.Field inline>
                    <label>Gas price</label>
                    <Input value={web3.utils.fromWei(this.state.gasPrice, 'gwei')} 
                        label={{basic: true, content: 'Gwei'}} labelPosition='right'
                        onChange={(e) => {
                                if (e.target.value < 1000000) {
                                    this.setState({gasPrice: web3.utils.toWei(e.target.value, 'gwei')});
                                }
                            }
                        }
                        style={{textAlign: 'right'}}/>
                    </Form.Field>
                    <Form.Field inline>
                    <label>Transaction fee: </label>
                    <label>{web3.utils.fromWei((this.state.estimatedGas*this.state.gasPrice).toString(), 'ether') + ' ETH'}</label>
                    </Form.Field>
                    <Form.Field>
                        <Message warning>{this.state.warningMessage}</Message>
                    </Form.Field>
                </Form>
            </Modal.Content>)
        }

        return (
            <Modal
                open={this.state.modalOpen}
                onClose={this.handleClose}
                size='mini'
                closeOnDimmerClick={false}
                >
                <Header icon="" content='Confirm transaction' />
                    {content}
                    <Modal.Actions>
                    <Button color='orange' onClick={this.handleApprove}>
                        Approve
                    </Button>
                    <Button color='red' onClick={this.handleReject}>
                        Reject
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
}

export default TransactionModal;