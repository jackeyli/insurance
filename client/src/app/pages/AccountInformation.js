import React, { Component } from "react";
import {Button,Segment,Label,List,Grid,Input,Table} from 'semantic-ui-react';
import _ from 'lodash';
import MessageStore from "../components/store/MessageStore";
export class AccountInformation extends Component {
    state={account:{address:'0x0',balance:100,share:'90%',orders:[{order_id:'ss',isDone:true}]}}
    componentDidMount = async()=>{
        if(this.props.global.web3 == null){
            return ;
        }
        this.refresh();
    }
    withDraw = async ()=>{
        let withDrawBalance = this.inputWithdraw.inputRef.value,
            wei = this.props.global.web3.utils.toWei(withDrawBalance,'ether');
        await this.props.global.contract.methods.withDrawBalance(wei).send({
            from:this.props.global.accounts[0],gas:200000});
        await this.refresh();
    }
    refresh = async ()=>{
        let account = await this.props.global.contract.
        methods.getMyAccountInfo().call({from:this.props.global.accounts[0]});
        account.address = this.props.global.accounts[0];
        let orders = await Promise.all(account.order_ids.map(async (t)=>{
            return _.merge(await this.props.global.contract.methods
                .getOrderInfo(t).call({from:this.props.global.accounts[0]}),{order_id:t});
        }));
        account.orders = orders;
        this.props.global.refreshContractState();
        this.setState({account:account});
    }
    switchPage = (pageName,params)=>{
        MessageStore.dispatch({
            type:'switchPage',
            data:{page:pageName,params:params}
        });
    }
    viewOrder = (order_id)=>{
        this.switchPage("OrderInformation",{order_id:order_id});
    }
    render() {
        return (
                <div>
                <Segment style={{margin:10}}>
                    <Label attached='top left' color="blue">Account</Label>
                    <Grid stackable>
                         <Grid.Row columns={2}>
                             <Grid.Column>
                                 <Label horizontal style={{marginBottom:10}}>
                                     Address:
                                 </Label>
                                 <br/>
                                 {this.state.account.address}
                             </Grid.Column>
                             <Grid.Column>
                                 <Label horizontal style={{marginBottom:10}}>
                                     Balance:
                                 </Label>
                                 <br/>
                                 {this.props.global.web3.utils.fromWei(this.state.account.balance.toString(),'ether')} ETH
                             </Grid.Column>
                         </Grid.Row>
                         <Grid.Row>
                             <Grid.Column>
                                 <Input ref={(inputWithdraw)=>this.inputWithdraw = inputWithdraw}type="number" placeholder="Please input the amount" style={{margin:10}}/>
                                 <Button primary onClick={()=>{this.withDraw()}}>Withdraw</Button>
                             </Grid.Column>
                         </Grid.Row>
                    </Grid>
                </Segment>
                <Segment style={{margin:10}}>
                    <Label attached='top left' color="blue">My Insurance Orders</Label>
                    <Table>

                        <Table.Header>
                        <Table.Row>
                                <Table.HeaderCell>
                                    Order ID
                                </Table.HeaderCell>
                                <Table.HeaderCell>
                                    Status
                                </Table.HeaderCell>
                                <Table.HeaderCell>
                                    Flight No.
                                </Table.HeaderCell>
                                <Table.HeaderCell>
                                    Departure Date
                                </Table.HeaderCell>
                                <Table.HeaderCell>

                                </Table.HeaderCell>
                        </Table.Row>
                        </Table.Header>
                        <Table.Body>
                        {
                            this.state.account.orders.map((t)=>{
                                return (
                                    <Table.Row>
                                        <Table.Cell>
                                            {t.order_id}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {(t.isDone ? (<Label style={{marginLeft:10}} color="red" horizontal>closed</Label>):(<Label style={{margin:10}} color="olive" horizontal>open</Label>))}
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Label horizontal>
                                                {t.flightNo}
                                            </Label>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Label horizontal>
                                                {t.expectedDepatureDate}
                                            </Label>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Button style={{margin:10}} icon='eye' content='View' size="mini"
                                                    onClick={this.viewOrder.bind(this,t.order_id)}/>
                                        </Table.Cell>
                                    </Table.Row>
                                )
                            })
                        }
                        </Table.Body>
                    </Table>
                </Segment>
                </div>
        )
    }
}