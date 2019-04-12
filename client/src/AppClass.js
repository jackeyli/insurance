import React,{Component} from 'react';
import {OrderInformation} from './app/pages/OrderInformation';
import {AccountInformation} from "./app/pages/AccountInformation";
import {Donate} from "./app/pages/Donate";
import {Insure} from "./app/pages/Insure";
import {Home} from './app/Home';
import {PageRouter,PageRoute} from "./app/components/router/pageRouter";
import {getWeb3AfterInitialized} from "./utils/getWeb3.js";
import FlightTest from "./contracts/FlightTest";
import Shareholder from "./contracts/Shareholder";
import MessageStore from "./app/components/store/MessageStore";
import './style.min.css';

class AppClass extends Component{
    state = {web3:null,accounts:null,contract:null,shareholderContract:null}
    componentDidMount = async()=>{
        try{
            let web3 = await getWeb3AfterInitialized();
            // Use web3 to get the user's accounts.
            let accounts = await web3.eth.getAccounts();
            let networkId = 4447,
                instance = await new web3.eth.Contract(FlightTest.abi,
                    // "0xe58847366a56b10ff1776630096d2c9c5fda4d66"),
                    FlightTest.networks[networkId].address),
                shareholderContract = await new web3.eth.Contract(Shareholder.abi,
                    // "0x4eb33f479c614ada28fac3b2098565ad5795239b");
                    Shareholder.networks[networkId].address);
            this.setState({web3:web3,accounts:accounts,contract:instance,
                shareholderContract:shareholderContract});
        }catch(error){
            console.log('err');
            // error here
        }
    }
    refreshContractState = ()=>{
        MessageStore.dispatch({
            type:'refreshContractState',
            data:null
        });
    }
    render (){
        debugger;
        if(!this.state.web3) {
            return null;
        } else {
        return (
        <div>
            <PageRouter component={Home} indexPage="AccountInformation"
        global={{web3:this.state.web3,
            accounts:this.state.accounts,
            contract:this.state.contract,
            shareholderContract:this.state.shareholderContract,
            refreshContractState: this.refreshContractState}}>
                <PageRoute path="OrderInformation" component= {OrderInformation}/>
                <PageRoute path="AccountInformation" component= {AccountInformation}/>
                <PageRoute path="Insure" component= {Insure}/>
                <PageRoute path="Donate" component= {Donate}/>
            </PageRouter>
        </div>
    );
        }
    }
}
export default AppClass;