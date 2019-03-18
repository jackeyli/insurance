import React, { Component } from "react";
import {Button, Label, Segment,Grid,Message} from "semantic-ui-react";
import {waitForEvent} from "../utils/utils";
import moment from 'moment';
export class OrderInformation extends Component {
    state = {payoutAmount:0};
    componentDidMount = async()=>{
        try {
            this.setState({isLoading:true});
            debugger;
            let order = await this.props.global.contract.methods
                    .getOrderInfo(this.props.param.order_id)
                    .call({from: this.props.global.accounts[0]}),
                flightStatus = await this.props.global.contract.methods
                    .getFlightStatus(order.flightNo, order.expectedDepatureDate)
                    .call({from: this.props.global.accounts[0]});
            if (flightStatus.checked) {
                this.updateOrder(order.payoutAmount, flightStatus.expectedArriveDate, flightStatus.actArriveDate);
            }
            this.setState({
                isDone: order.isDone,
                payoutAmount: order.payoutAmount,
                user: order.user,
                flightNo: order.flightNo,
                expectedDepatureDate: order.expectedDepatureDate
            })
        }finally{
            this.setState({isLoading:undefined})
        }
    }
    updateOrder = (payOutAmt,expArrSec,actArrSec,compensateAmt)=> {
        let offset = new Date().getTimezoneOffset()* 60 * 1000,
            expectedArriveDate = moment(expArrSec * 1000 + offset)
                .format("YYYY-MM-DD HH:mm"),
            actArriveDate = moment(actArrSec * 1000 + offset)
                .format("YYYY-MM-DD HH:mm"),
            delay = ((actArrSec - expArrSec) > 0 ? (actArrSec - expArrSec) : 0);
        if(compensateAmt === undefined) {
            if (delay >= 3600) {
                compensateAmt = payOutAmt * 10;
            } else if (delay >= 1800) {
                compensateAmt = payOutAmt * 5;
            } else {
                compensateAmt = payOutAmt / 10;
            }
        }
        this.setState({estDate:expectedArriveDate,actDate:actArriveDate,
            delay:delay,compensateAmt:compensateAmt,statusUpdated:true});
    }
    onCompensateClick = async()=>{
        try{
            this.setState({isLoading:true});
            await this.props.global.contract.methods.claimCompensation(this.props.param.order_id).send({
                from: this.props.global.accounts[0],
                gas: 300000
            });
            let order = await this.props.global.contract.methods
                .getOrderInfo(this.props.param.order_id)
                .call({from: this.props.global.accounts[0]});
            this.setState({isDone:order.isDone});
        }finally{
            this.props.global.refreshContractState();
            this.setState({isLoading:false});
        }
    }
    requestUpdate = async()=>{
        try {
            this.setState({isLoading:true});
            let gasPrice = await this.props.global.web3.eth.getGasPrice(),
                blockNumber = (await this.props.global.web3.eth.getBlock('latest')).number,
                flightNo = this.state.flightNo,
                expectedDepatureDate = this.state.expectedDepatureDate;

                await this.props.global.contract.methods.requestUpdate(this.props.param.order_id).send({
                    from: this.props.global.accounts[0],
                    gas: 200000,
                    value:this.props.global.web3.utils.toWei("0.008",'ether')
                });
                let myEvent = await waitForEvent(this.props.global.contract, 'LogFlightStatusUpdate',
                    (t) => {
                        return t.returnValues.flightNo == flightNo &&
                            t.returnValues.expectedDepatureDate == expectedDepatureDate
                    }, blockNumber, 5, 90);
                if(myEvent.returnValues.isSuccess) {
                    this.updateOrder(this.state.payoutAmount, myEvent.returnValues.expectedArriveDate, myEvent.returnValues.actArriveDate);
                    this.setState({showMsg: true, messageType: 'positive', messageContent: 'Update order success.'});
                } else {
                    this.setState({showMsg: true, messageType: 'negative', messageContent:
                            'Update order failed. This might cause by wrong flight No, wrong departure date or latency of data'});
                }

        }finally{
            this.setState({isLoading:undefined});
        }
    }
    render() {
        return (
        <div>
            <Segment style={{margin:10}}>
                <Label attached='top left' color="blue">Order   {this.props.param.order_id}</Label>
                <Grid stackable>
                    <Grid.Row>
                        <Grid.Column>
                            {this.state.isDone ? (<Label color="red"> closed </Label>) : (<Label color="green"> opened</Label>)}
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row columns={3}>
                        <Grid.Column>
                            <Label style={{marginBottom:10}} horizontal>
                                Insure Amount:
                            </Label>
                            <br/>
                            {this.props.global.web3.utils.fromWei(this.state.payoutAmount.toString(),'ether')}    ETH
                        </Grid.Column>
                        <Grid.Column>
                            <Label style={{marginBottom:10}} horizontal>
                                Insured:
                            </Label>
                            <br/>
                            {this.state.user}
                        </Grid.Column>
                        <Grid.Column>
                            <Label style={{marginBottom:10}} horizontal>
                                Flight No.:
                            </Label>
                            <br/>
                            {this.state.flightNo}
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row columns={3}>
                        <Grid.Column>
                            <Label style={{marginBottom:10}} horizontal>
                                Flight Depature Date:
                            </Label>
                            <br/>
                            {this.state.expectedDepatureDate}
                        </Grid.Column>
                        <Grid.Column>
                            <Label style={{marginBottom:10}} horizontal>
                                Flight Estimated Arrival Time:
                            </Label>
                            <br/>
                            {this.state.estDate}
                        </Grid.Column>
                        <Grid.Column>
                            <Label style={{marginBottom:10}} horizontal>
                                Flight Actual Arrival Time:
                            </Label>
                            <br/>
                            {this.state.actDate}
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row columns={3}>
                        <Grid.Column>
                            <Label style={{marginBottom:10}}>
                                Flight Late Minutes:
                            </Label>
                            <br/>
                            {this.state.delay / 60} MIN
                        </Grid.Column>
                        <Grid.Column>
                            <Label style={{marginBottom:10}}>
                                Compensation Value:
                            </Label>
                            <br/>
                            {this.state.compensateAmt !== undefined?
                                this.props.global.web3.utils.fromWei(this.state.compensateAmt.toString(),'ether') : 'N/A'} ETH
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row columns={3}>
                        <Grid.Column>
                            <Button loading={this.state.isLoading}
                                    disabled={!this.state.isLoading && this.state.delay === undefined ? undefined : true} primary onClick={()=>{this.requestUpdate();}}>Request Update</Button>
                        </Grid.Column>
                        <Grid.Column>
                            <Button loading={this.state.isLoading}
                                    disabled = {!this.state.isLoading && this.state.statusUpdated ? undefined : true}
                                    onClick={()=>{this.onCompensateClick();}}
                                    primary>Claim Compensation / Close Order</Button>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid>
                        <Grid.Row>
                            <Grid.Column>
                                {
                                    this.state.showMsg ? (<Message positive={this.state.messageType == 'positive' ? true : undefined}
                                             negative={this.state.messageType == 'negative' ? true : undefined}>
                                        {this.state.messageContent}
                                    </Message>) : null
                                }
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Grid>
            </Segment>
        </div>
    )
    }
}