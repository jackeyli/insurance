import React, { Component } from "react";
import {Button, Icon, Input, Label, Table, Segment, Header, Grid, Item} from "semantic-ui-react";
import moment from 'moment';
export class Donate extends Component {
    state = {profitBalance:0,dividendHistory:[],myProfitHistory: [],dividendProfit:0,donateEther:0,myBalance:0}
    componentDidMount = ()=>{
        this.refresh();
    }
    onRequestDividend = async()=>{
            try {
                this.setState({isLoading:true});
                await this.props.global.contract.methods.dividend().send(
                    {
                        from: this.props.global.accounts[0],
                        gas: 300000
                    });
                this.refresh();
            }finally{
                this.setState({isLoading:false});
            }
    }
    onGetMyShare = async(year)=>{
        try {
            this.setState({isLoading:true});
            await this.props.global.shareholderContract.methods.getMyShareOfProfit(year).send(
                {
                    from: this.props.global.accounts[0],
                    gas: 200000
                });
            this.refresh();
        }finally{
            this.setState({isLoading:false})
        }
    }
    onDonateClick = async()=>{
        try {
            this.setState({isLoading:true});
            let amount = +this.inputDonateAmt.inputRef.value;
            await this.props.global.contract.methods.donate().send(
                {
                    from: this.props.global.accounts[0],
                    gas: 300000,
                    value: this.props.global.web3.utils.toWei(amount.toString(), 'ether')
                });
            this.refresh();
        }finally{
            this.setState({isLoading:false});
        }
    }

    onWithdrawClick = async()=>{
        try {
            this.setState({isLoading:true});
            let amount = +this.inputWithdrawAmt.inputRef.value;
            await this.props.global.shareholderContract.methods
                .withDraw(this.props.global.web3.utils.toWei(amount.toString(), 'ether')).send(
                {
                    from: this.props.global.accounts[0],
                    gas: 200000
                });
            this.refresh();
        }finally{
            this.setState({isLoading:false});
        }
    }
    onChangeDonateValue = ()=>{
        this.setState({donateEther:+this.inputDonateAmt.inputRef.value});
    }
    refresh = async()=>{
       let myToken = await this.props.global.shareholderContract.methods
               .getShareToken(this.props.global.accounts[0]).call(
            {
                from: this.props.global.accounts[0]
            });
       let totalToken = await this.props.global.shareholderContract.methods.totalShareholderToken().call(
               {
                   from: this.props.global.accounts[0]
               }
           );
       let nextPriceTs = await this.props.global.shareholderContract.methods.nextPriceTs().call(
               {
                   from: this.props.global.accounts[0]
               }
           );
       let currentTokenPrice = await this.props.global.shareholderContract.methods.getCurrentTokenPrice().call(
               {
                   from: this.props.global.accounts[0]
               }
           );
       let dividendLen =  await this.props.global.contract.methods.getDividendLen().call(
           {
               from: this.props.global.accounts[0]
           }
       );
       let dividendPromises = [];
       for(let i = 0; i < dividendLen; i ++){
           dividendPromises.push((async(idx)=>{
               return await this.props.global.contract.methods.getDividendHistory(idx).call(
                   {
                       from: this.props.global.accounts[0]
                   }
               );
           })(i))
       }
       let dividendHistory = (await Promise.all(dividendPromises)) ;
       let dividendStatus = await this.props.global.shareholderContract.methods.getLastDividendStatus().call(
               {
                   from: this.props.global.accounts[0]
               }
           );
       let myShareOfProfitsPromises = [];
       for(let i = 0; i < dividendHistory.length; i ++){
           myShareOfProfitsPromises.push((async(hist)=>{
              let myProfit = await this.props.global.shareholderContract.methods.getMyAmtOfShareOfProfit(hist.year).call(
                   {
                       from:this.props.global.accounts[0]
                   }
               );
              let isClaimed = await this.props.global.shareholderContract.methods.isYearClaimedProfit(hist.year).call(
                  {
                      from:this.props.global.accounts[0]
                  }
              );
              return {profit:myProfit,isClaimed:isClaimed,year:hist.year};
           })(dividendHistory[i]))
       }
       let myBalance = await this.props.global.shareholderContract.methods.getMyBalance().call(
           {
               from:this.props.global.accounts[0]
           }
       );
       let myProfitHistory = await Promise.all(myShareOfProfitsPromises);
       let dividendCloseTime = moment(new Date(dividendStatus.closeDividendTs * 1000)).format('YYYY-MM-DD HH:mm:ss');
       let dividendOpen = new Date().getTime() <= (dividendStatus.startTs + 31 * 86400) * 1000;
       let dividendProfit = dividendStatus.profit;
       let dividendYear = dividendStatus.year;
       this.setState(
           {
               myToken:myToken,
               totalToken:totalToken,
               dividendHistory:dividendHistory,
               dividendStatus:dividendStatus,
               dividendCloseTime:dividendCloseTime,
               dividendOpen:dividendOpen,
               dividendProfit:dividendProfit,
               dividendYear:dividendYear,
               myProfitHistory:myProfitHistory,
               nextPriceTs:nextPriceTs,
               currentTokenPrice:currentTokenPrice,
               myBalance:myBalance
           });
       this.props.global.refreshContractState();
    }
    render() {
        return (
            <div>
                <Segment style={{margin: 10,background:'grey'}}>
                    <Header as="h2" style={{color:'white'}}>
                        <Icon name="ethereum"></Icon>
                        Donating, Get Share！
                    </Header>
                </Segment>
                <Segment style={{margin: 10}}>

                    <Label attached='top left' color="blue">Donate</Label>
                <Grid stackable>
                    <Grid.Row columns={2}>
                        <Grid.Column>
                    <span><Label style={{margin:10}}>My Share Token:</Label>
                        {this.state.myToken} / {this.state.totalToken}</span>
                            <br/>
                    <span><Label style={{margin:10}}>My Balance:</Label>
                    {this.props.global.web3.utils.fromWei(this.state.myBalance.toString(),'ether')} ETH</span>
                            <br/>
                            <Input ref={(inputWithdrawAmt)=>this.inputWithdrawAmt = inputWithdrawAmt}icon type="number"
                                   placeholder='Input the amount to withdraw' style={{margin:10}}>
                                <Icon name="ethereum"/>
                                <input />
                            </Input>
                            <Button
                                loading={this.state.isLoading}
                                disabled={this.state.isLoading ? true:undefined}
                                primary style={{margin:10}} onClick={()=>{this.onWithdrawClick()}}>
                                Withdraw
                            </Button>
                    <Header as='h5' style={{margin:10}} disabled>
                        You will get {Math.floor(this.state.donateEther  * this.state.currentTokenPrice) } Share token
                    </Header>
                    <Input ref={(inputDonateAmt)=>this.inputDonateAmt = inputDonateAmt}icon type="number"
                           placeholder='Input the amount to donate' style={{margin:10}}
                     onChange={()=>{this.onChangeDonateValue()}}>
                        <Icon name="ethereum"/>
                        <input />
                    </Input>
                    <Button
                        loading={this.state.isLoading}
                        disabled={this.state.isLoading ? true:undefined}
                        primary style={{margin:10}} onClick={()=>{this.onDonateClick()}}>
                        Donate
                    </Button>
                        </Grid.Column>
                        <Grid.Column>
                                <Item.Group>
                                    <Item>
                                        <Item.Content>
                                            <Item.Header as='a'>
                                                1 ETH for {this.state.currentTokenPrice} share now.
                                            </Item.Header>
                                            <Item.Description>
                                                <div>The price of share will double every 180 days.</div>
                                                Next price : 1 ETH for {this.state.currentTokenPrice / 2} share start from
                                                {moment(new Date(this.state.nextPriceTs * 1000)).format('YYYY-MM-DD HH:mm:ss')}
                                           </Item.Description>
                                        </Item.Content>
                                    </Item>
                                </Item.Group>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>

                </Segment>
                <Segment style={{margin: 10}}>
                    <Label attached='top left' color="blue">Dividend History</Label>
                    <Grid stackable>
                        <Grid.Row columns={1}>
                            <Grid.Column>
                    <Table celled>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Year</Table.HeaderCell>
                                <Table.HeaderCell>Contract Total Profit</Table.HeaderCell>
                                <Table.HeaderCell>Dividend Date</Table.HeaderCell>
                                <Table.HeaderCell>Request Address</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>

                        <Table.Body>
                            {
                                this.state.dividendHistory.map((hist)=>
                                    (<Table.Row>
                                        <Table.Cell>
                                            {hist.year}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {this.props.global.web3.utils.fromWei(hist.profit,'ether')} ETH
                                        </Table.Cell>
                                        <Table.Cell>
                                            {moment(new Date(hist.timestamp * 1000)).format('YYYY-MM-DD HH:mm:ss')}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {hist.triggerAddr}
                                        </Table.Cell>
                                    </Table.Row>))
                            }
                        </Table.Body>
                    </Table>
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row>
                            <Grid.Column textAlign="center">
                                        <Table>
                                            <Table.Header>
                                                <Table.Row>
                                                    <Table.HeaderCell>Year</Table.HeaderCell>
                                                    <Table.HeaderCell>My Share of Profit</Table.HeaderCell>
                                                    <Table.HeaderCell></Table.HeaderCell>
                                                </Table.Row>
                                            </Table.Header>
                                            <Table.Body>
                                                {
                                                    this.state.myProfitHistory.map((hist)=>{
                                                        return (
                                                            <Table.Row>
                                                                <Table.Cell>
                                                                    {hist.year}
                                                                </Table.Cell>
                                                                <Table.Cell>
                                                                    {
                                                                        this.props.global.web3.utils.fromWei
                                                                        (hist.profit.toString(),
                                                                        'ether')
                                                                    } ETH
                                                                </Table.Cell>
                                                                <Table.Cell>
                                                                    {hist.isClaimed ? 'Claimed' : (
                                                                        <Button onClick={this.onGetMyShare.bind(this,hist.year)}>
                                                                            Get My Share
                                                                        </Button>
                                                                    )}
                                                                </Table.Cell>
                                                            </Table.Row>
                                                        )
                                                    })
                                                }
                                            </Table.Body>
                                        </Table>
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row>
                            <Grid.Column>
                                <Header as="h5" disabled>
                                    Any shareholder could start a dividend during Dec once a year.
                                </Header>
                                <Button
                                    loading={this.state.isLoading}
                                    disabled={(this.state.isLoading ||
                                    this.state.dividendOpen)? true:undefined}
                                    primary style={{margin:10}}
                                    onClick={()=>{this.onRequestDividend()}}>
                                    Start Dividend
                                </Button>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Segment>
            </div>
        )
    }
}