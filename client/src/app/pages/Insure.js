import React, { Component } from "react";
import {Button, Label, Segment,Input,Icon,Grid,Message,Checkbox,Card,Header} from "semantic-ui-react";
import {waitForEvent} from '../utils/utils';
import _ from 'lodash';
import {InsureCard} from "../components/InsureCard";
export class Insure extends Component {
    state = {isLoading:undefined,checkValidMsg:{isFlightValid:true,showCheckMessage:false,content:null},
    selectionName:"",amount:0,messageContent:'',messageType:'none',allowToSubmit:false,ticketBought:false};
    checkValid = async()=>{
        let flightNo = this.inputflightNumber.inputRef.value,
            gasPrice = await this.props.global.web3.eth.getGasPrice();
        this.setState({isLoading:true});
        try {
            await this.props.global.contract.methods
                .checkValidFlight(flightNo).send({
                    from: this.props.global.accounts[0],
                    gas: 240000,
                    value:this.props.global.web3.utils.toWei("0.004",'ether')
                });
            let blockNumber = (await this.props.global.web3.eth.getBlock('latest')).number;
            try {
                let myEvent = await waitForEvent(this.props.global.contract, 'LogCheckValid',
                    (t) => {
                        return t.returnValues.flightNo == flightNo
                    }, blockNumber, 5,60);
                if (myEvent.returnValues.result.length > 0) {
                    this.setState({
                        checkValidMsg: {
                            isFlightValid: true, showCheckMessage: true, content:
                                ('Flight ' + flightNo + ' is Supported')
                        }
                    });
                } else {
                    this.setState({
                        checkValidMsg: {
                            isFlightValid: false, showCheckMessage: true, content:
                                ('Flight ' + flightNo + ' is not supported')
                        }
                    });
                }
            } catch (e) {
                this.setState({
                    checkValidMsg: {
                        isFlightValid: false, showCheckMessage: true, content:
                            ('Flight ' + flightNo + ' is not supported')
                    }
                });
            }
        }finally{
            this.props.global.refreshContractState();
            this.setState({isLoading:undefined});
        }
    }
    checkIfAllowToSubmit = ()=>{
        if(this.state.ticketBought &&
            this.state.amount >= 0.01 && this.state.amount <= 10
        && !_.isEmpty(this.inputFlightDate.inputRef.value)
        && !_.isEmpty(this.inputflightNumber.inputRef.value)) {
            this.setState({allowToSubmit:true})
        } else {
            this.setState({allowToSubmit:false})
        }
    }
    insure = async()=>{
        let flightNo = this.inputflightNumber.inputRef.value,
            flightDate = this.inputFlightDate.inputRef.value,
            timeDatas = flightDate.split("-"),
            dateUint = ((+timeDatas[0]) << 16) + ((+timeDatas[1]) << 8) + (+timeDatas[2]);
        try{
            if(this.state.amount < 0.01 || this.state.amount > 10) {
                this.setState({messageType:'negative',messageContent:'The amount should be more than 0.01 and less than 10'});
                return;
            }
            this.setState({isLoading:true});
            let blockNumber = (await this.props.global.web3.eth.getBlock('latest')).number;
                await this.props.global.contract.methods.insure(flightNo,dateUint).send(
                    {
                        from: this.props.global.accounts[0],
                        gas: 300000,
                        value: this.props.global.web3.utils.toWei(this.state.amount.toString(), 'ether')
                    });
            this.setState({messageType:'positive',
                messageContent:'You have already apply the Insurance on Flight:' + flightNo + ', Date :' + flightDate});

        }catch(e){

        }
        finally{
            this.props.global.refreshContractState();
            this.setState({isLoading:false});
        }
    }
    onamountChanged = (amount)=>{
        this.setState({amount:amount},this.checkIfAllowToSubmit);
    }
    onInsureSelectionChanged = (name)=>{
        this.setState({selectionName:name},this.checkIfAllowToSubmit);
    }
    render() {
        let limitString = ">0.1 and < 10";
        return (
            <div>
                <Segment style={{margin: 10}}>
                    <Label attached='top left' color="blue">Insure</Label>
                    <Grid stackable>
                        <Grid.Row columns={2}>
                            <Grid.Column width={5}>
                                <Label style={{margin:10}}>Flight No.:</Label>
                                <br/>
                                <Input ref={(inputflightNumber)=>{this.inputflightNumber = inputflightNumber}}
                                       onChange = {()=>{this.checkIfAllowToSubmit();}}
                                       placeholder='Input the Flight Number' style={{margin:10}}/>
                                <Button disabled={!this.state.isLoading ? undefined : true} loading={this.state.isLoading} size="tiny" icon labelPosition='left'
                                        style={{margin:10}}
                                        onClick={()=>{this.checkValid()}}>
                                    <Icon name='check' />
                                    Check support
                                </Button>
                                <br/>
                                <Header as='h5' style={{margin:10}} disabled>
                                    Check support will consume your 0.004 eth
                                </Header>
                    {
                        this.state.checkValidMsg.showCheckMessage ? (
                            this.state.checkValidMsg.isFlightValid ?
                                (
                                    <Message positive>
                                        {this.state.checkValidMsg.content}
                                    </Message>
                                ) : (
                                    <Message negative>
                                        {this.state.checkValidMsg.content}
                                    </Message>
                                )
                         ) : null
                    }
                    <br/>
                    <Label style={{margin:10}}>Flight Depature Date (Local Time):</Label>
                    <br/>
                    <Header as='h5' style={{margin:10}} disabled>
                         Please insure 48 hours before depature date.
                    </Header>
                    <Input type="date" ref={(inputFlightDate)=>{this.inputFlightDate = inputFlightDate}}
                           onChange = {()=>{this.checkIfAllowToSubmit();}}
                           placeholder='Please Input Depature Date'
                           style={{margin:10}}/>
                    <br/>
                    <Header as='h5' style={{margin:10}} disabled>
                           Please make sure you input the right date.
                    </Header>
                    <Checkbox ref={(checkBoxticketBought)=>{this.checkBoxticketBought = checkBoxticketBought}} onChange={(event,element)=>{this.setState({ticketBought:element.checked},this.checkIfAllowToSubmit);}}label='I swear I have bought the ticket' style={{margin:10}}/>
                                <Card>
                                    <Card.Content>
                                        <Card.Header>
                                            How to claim compensation ?
                                        </Card.Header>
                                    </Card.Content>
                                    <Card.Content>
                                        <Card.Meta>
                                            <div>Step 1: Wait until the flight arrive</div>
                                            <div>Step 2: Find your order under account information</div>
                                            <div>Step 3: Click View Button</div>
                                            <div>Step 4: if the flight actual arrival date is not updated, click request update and wait until it updated</div>
                                            <div>Step 5: Click Claim Compensation Button.If the flight is late for more than half an hour,
                                                         you will get compensation in your account.</div>
                                            <div>Step 6: Withdraw your balance in your account</div>
                                            <div style={{fontSize:14,color:'black',marginBottom:5}}>
                                                Once you claim your compensation, you will get at least 10% payment back.
                                            </div>
                                            <div style={{fontSize:14,color:'black'}}>
                                                You should make sure your flight No is supported and the departure date is
                                                correct. Also, you shouldclick request update to update your flight status within 7 days
                                                after arrive or you will lose the chance to claim compensation
                                            </div>
                                        </Card.Meta>
                                    </Card.Content>
                                </Card>
                    </Grid.Column >
                        <Grid.Column width={11}>
                            <Card.Group>
                            <InsureCard amount={0.05}
                                        minAmt = {0.05}
                                        maxAmt = {10}
                                        isCustomized={false}
                                isChecked={this.state.selectionName == "0.01"}
                                        name={"0.01"}
                                insureSelectionChanged={this.onInsureSelectionChanged.bind(this)}
                                        amountChanged={this.onamountChanged.bind(this)}
                            />
                                <InsureCard amount={0.1} isCustomized={false}

                                            minAmt = {0.05}
                                            maxAmt = {10}
                                            isChecked={this.state.selectionName == "0.1"}
                                            name={"0.1"}
                                            insureSelectionChanged={this.onInsureSelectionChanged.bind(this)}
                                            amountChanged={this.onamountChanged.bind(this)}
                                />
                                <InsureCard amount={1} isCustomized={false}

                                            minAmt = {0.05}
                                            maxAmt = {10}
                                            isChecked={this.state.selectionName == "1"}
                                            name={"1"}
                                            insureSelectionChanged={this.onInsureSelectionChanged.bind(this)}
                                            amountChanged={this.onamountChanged.bind(this)}
                                />
                                <InsureCard amount={10} isCustomized={false}

                                            minAmt = {0.05}
                                            maxAmt = {10}
                                            isChecked={this.state.selectionName == "10"}
                                            name={"10"}
                                            insureSelectionChanged={this.onInsureSelectionChanged.bind(this)}
                                            amountChanged={this.onamountChanged.bind(this)}
                                />
                                <InsureCard amount={0.05} isCustomized={true}

                                            minAmt = {0.05}
                                            maxAmt = {10}
                                            isChecked={this.state.selectionName == "Customized"}
                                            name={"Customized"}
                                            insureSelectionChanged={this.onInsureSelectionChanged.bind(this)}
                                            amountChanged={this.onamountChanged.bind(this)}
                                />
                            </Card.Group>
                        </Grid.Column>
                        </Grid.Row>
                        <Grid.Row columns={1}>
                            <Grid.Column>
                                <Button disabled={!this.state.isLoading && this.state.allowToSubmit ? undefined : true} loading={this.state.isLoading} primary icon labelPosition='left' style={{margin:10}}
                                        onClick={()=>{this.insure()}}>
                                    <Icon name='check'/>
                                    submit
                                </Button>
                                <Message positive={this.state.messageType == "positive" ? true : undefined}
                                         negative={this.state.messageType == "negative" ? true : undefined}
                                         style={{display:
                                                 (this.state.messageType == "positive" || this.state.messageType == "negative") ?
                                                 '' : 'none'}}>
                                    {this.state.messageContent}
                                </Message>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Segment>
            </div>
        )
    }
}