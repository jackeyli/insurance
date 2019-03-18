import React,{Component} from 'react';
import {HeaderCompoment} from './Header';
import {Grid,Button,Statistic,Header,Icon} from 'semantic-ui-react';
import './semantic.min.css';
import './App.css';
import MessageStore from "./components/store/MessageStore";
export class Home extends Component {
    state={contractBalance:0,contractTotalProfit:0,shareToken:0}
    switchPage = (pageName,params)=>{
        MessageStore.dispatch({
            type:'switchPage',
            data:{page:pageName,params:params}
        });
    }
    componentDidMount = async()=>{
        let me = this;
        MessageStore.subscribe(()=>{
            let state = MessageStore.getState();
            if(state.type == "refreshContractState") {
                me.refresh();
            }
        });
        this.refresh();
    }
    refresh = async()=>{
        let contractBalance = await this.props.global.contract.methods
                .getContractBalance().call({from: this.props.global.accounts[0]}),
            contractTotalProfit = await this.props.global.contract.methods
                .getContractProfit().call({from: this.props.global.accounts[0]}),
            shareToken = await this.props.global.shareholderContract.methods.totalShareholderToken()
                .call({from:this.props.global.accounts[0]});
        this.setState({contractBalance:contractBalance,contractTotalProfit:contractTotalProfit,
            shareToken:shareToken});
    }
    render(){
        return (
                <div className="container" style={{display:'flex',flexDirection:'column',height:'100vh'}}>
                    <div className="row">
                        <HeaderCompoment/>
                    </div>
                    <div className="row" style={{flex:1,display:'flex',flexDirection:'column'}}>
                        <Grid stackable >
                            <Grid.Row>
                                <Grid.Column style={{width:'auto'}}>
                                    <Button style={{margin:'5px'}} toggle active={this.props.currentPageName == 'AccountInformation'}
                                        onClick={()=>{this.switchPage("AccountInformation")}}>
                                            Account Information
                                    </Button>
                                    <Button style={{margin:'5px'}} toggle active={this.props.currentPageName == 'Insure'}
                                        onClick={()=>{this.switchPage("Insure")}}>
                                        Insure
                                    </Button>
                                    <Button style={{margin:'5px'}} toggle active={this.props.currentPageName == 'Donate'}
                                        onClick={()=>{this.switchPage("Donate")}}>
                                        Donate
                                    </Button>
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row>
                                <Grid.Column>
                                    <Header as='h3' icon textAlign='center' style={{marginTop:10}}>
                                        <Header.Content>
                                            <Grid stackable>
                                                <Grid.Row columns={4}>
                                                    <Grid.Column>
                                                        <Icon name='users' circular />
                                                            Contract Status
                                                        <div style={{fontSize:12}}> Contract status listed here, all the data are public </div>
                                                    </Grid.Column>
                                                    <Grid.Column>
                                                        <Statistic size="mini">
                                                            <Statistic.Value>{this.props.global.web3.utils.fromWei(this.state.contractBalance.toString(),
                                                                'ether')} ETH</Statistic.Value>
                                                            <Statistic.Label>total balance</Statistic.Label>
                                                        </Statistic>
                                                    </Grid.Column>
                                                    <Grid.Column>
                                                        <Statistic size="mini">
                                                            <Statistic.Value>{this.props.global.web3.utils.fromWei(this.state.contractTotalProfit.toString(),
                                                                'ether')} ETH</Statistic.Value>
                                                            <Statistic.Label>total undividended profit (Estimated)</Statistic.Label>
                                                        </Statistic>
                                                    </Grid.Column>
                                                    <Grid.Column>
                                                        <Statistic size="mini">
                                                            <Statistic.Value>{this.state.shareToken}</Statistic.Value>
                                                            <Statistic.Label>total share token</Statistic.Label>
                                                        </Statistic>
                                                    </Grid.Column>
                                                </Grid.Row>
                                            </Grid>
                                        </Header.Content>
                                    </Header>
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row>
                                <Grid.Column width = {16} style={{border:'1px',marginTop:0}}>
                                    {this.props.pageContent}
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </div>
                </div>
        )
    }



}
