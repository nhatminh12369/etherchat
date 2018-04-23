// Copyright (c) 2018 Nguyen Vu Nhat Minh
// Distributed under the MIT software license, see the accompanying file LICENSE

import {Component} from 'react';
import Constant from '../support/Constant';
import {Button} from 'semantic-ui-react';
import appDispatcher from '../core/AppDispatcher';

class Footer extends Component {
    openGuide(e) {
        e.preventDefault();
        appDispatcher.dispatch({
            action: Constant.ACTION.OPEN_GUIDE
        })
    }

    render() {
        return (
            <div style={{textAlign: 'center', marginTop: 10, marginBottom: 10}}>
            <a href='/'>Home</a>
            <a style={{marginLeft: 20}} onClick={this.openGuide} href='#'>Guide</a>
            <a style={{marginLeft: 20}} href='/terms'>Term of use</a>
            <a style={{marginLeft: 20}} href='/about'>About {Constant.APP_NAME}</a>
            </div>
        );
    }
}

export default Footer;