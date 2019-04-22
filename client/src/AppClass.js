import React,{Component} from 'react';
import {OrderInformation} from './app/pages/OrderInformation';
import {AccountInformation} from "./app/pages/AccountInformation";
import {Donate} from "./app/pages/Donate";
import {Insure} from "./app/pages/Insure";
import {Home} from './app/Home';
import {PageRouter,PageRoute} from "./app/components/router/pageRouter";
import {getWeb3AfterInitialized} from "./utils/getWeb3.js";
import FlightTest from "./contracts/FlightTest.json";
import Shareholder from "./contracts/Shareholder.json";
import MessageStore from "./app/components/store/MessageStore";
import './style.min.css';

class AppClass extends Component{
    state = {web3:null,accounts:null,contract:null,shareholderContract:null}
    componentDidMount = async()=>{
        try{
            let web3 = await getWeb3AfterInitialized();
            // Use web3 to get the user's accounts.
            let accounts = await web3.eth.getAccounts(),
                networkId = 5777,
                instance = await new web3.eth.Contract(FlightTest.abi,
                         //"0xb4fd9122180369c0c0478b1899028e0ad5e3a953"),
                    FlightTest.networks[networkId].address),
                shareholderContract = await new web3.eth.Contract(Shareholder.abi,
                     //"0xf00d711d59a7d85b1f88213f66344f25b994cebb");
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