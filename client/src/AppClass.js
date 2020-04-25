import React,{Component} from 'react';
import {Home} from './app/Home';
import {PageRouter,PageRoute} from "./app/components/router/pageRouter";
import {AsyncLoader} from "./app/components/router/AsyncLoader";
import {getWeb3AfterInitialized,getWeb3} from "./utils/getWeb3.js";
import FlightInsurance from "./contracts/FlightInsurance.json";
import Shareholder from "./contracts/Shareholder.json";
import appEnv from "./env.json"
import MessageStore from "./app/components/store/MessageStore";
import './style.min.css';
import Loadable from 'react-loadable';
const OrderInformation = import(/* webpackChunkName: "OrderInformation" */'./app/pages/OrderInformation').then((cmp)=>cmp["OrderInformation"])
const AccountInformation = import(/* webpackChunkName: "AccountInformation" */ './app/pages/AccountInformation').then((cmp)=>cmp["AccountInformation"])
const Donate = import(/* webpackChunkName: "Donate" */"./app/pages/Donate").then((cmp)=>cmp["Donate"])
const Insure = import(/* webpackChunkName: "Insure" */"./app/pages/Insure").then((cmp)=>cmp["Insure"])
class AppClass extends Component{
    state = {web3:null,accounts:null,contract:null,shareholderContract:null,
    networkName:""}
    componentDidMount = async()=>{
        try{
            const web3 = await getWeb3AfterInitialized();
            if(!web3 ) {
                window.alert("please login metamask and switch to main network");
                window.location.reload()
            }
            const ntName = await web3.eth.net.getNetworkType();
            // Use web3 to get the user's accounts.
            let accounts = await web3.eth.getAccounts(),
                networkId = await web3.eth.net.getId(),
                instance = await new web3.eth.Contract(FlightInsurance.abi,
                         "0xfe584b2ab98f07bcae16dad0952953bcd4e47eee"),
                    //FlightInsurance.networks[networkId].address),
                shareholderContract = await new web3.eth.Contract(Shareholder.abi,
                     "0xf6ce2ccaa57eb280d04fda927387e85e2a93fa1c");
                    //Shareholder.networks[networkId].address);
            this.setState({web3:web3,accounts:accounts,contract:instance,
                shareholderContract:shareholderContract,networkName:ntName});
            let curAccount = accounts[0];
            if(this.state.networkName != 'main' && !appEnv.debugMode) {
                window.alert("please login metamask and switch to main network");
                window.location.reload()
                return null
            }
            setInterval(async function(){
                let account = await web3.eth.getAccounts();
                if(account[0] != curAccount){
                    window.location.reload();
                }
            },1000);
        }catch(error){
            window.alert("please login metamask and switch to main network");
            //window.location.reload()
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
        if(!this.state.web3 || (this.state.networkName != 'main' && !appEnv.debugMode)) {
            return null;
        }
        return (
        <div>
            <PageRouter component={Home} indexPage="/AccountInformation"
        global={{web3:this.state.web3,
            accounts:this.state.accounts,
            contract:this.state.contract,
            shareholderContract:this.state.shareholderContract,
            refreshContractState: this.refreshContractState,
            networkName:this.state.networkName}}>
                <PageRoute path="/OrderInformation" component = {AsyncLoader} loadercomponent= {OrderInformation}/>
                <PageRoute path="/AccountInformation" component = {AsyncLoader} loadercomponent= {AccountInformation}/>
                <PageRoute path="/Insure" component = {AsyncLoader} loadercomponent= {Insure}/>
                <PageRoute path="/Donate" component = {AsyncLoader} loadercomponent= {Donate}/>
            </PageRouter>
        </div>
    );
        }

}
export default AppClass;