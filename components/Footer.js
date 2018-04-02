// Copyright (c) 2018 Nguyen Vu Nhat Minh
// Distributed under the MIT software license, see the accompanying file LICENSE

import {Component} from 'react';
import Constant from '../support/Constant';

class Footer extends Component {
    render() {
        return (
            <div style={{textAlign: 'center', marginTop: 10, marginBottom: 10}}>
            <a href='/terms'>Term of use</a>
            <a style={{marginLeft: 20}}>Guide</a>
            <a style={{marginLeft: 20}}>About {Constant.APP_NAME}</a>
            </div>
        );
    }
}

export default Footer;