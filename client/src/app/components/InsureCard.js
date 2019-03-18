import React, { Component } from "react";
import {Button, Label, Segment,Input,Icon,Grid,Message,Checkbox,Header,Card} from "semantic-ui-react";
export class InsureCard extends Component{
    state = {amtExceedLimit:false,amount:this.props.amount}
    amountChange = ()=> {
        let amount = +this.inputAmount.inputRef.value;
        this.setState({amount:amount});
        if(amount < this.props.minAmt){
            setTimeout(()=>{
                this.inputAmount.inputRef.value = this.props.minAmt;
                this.setState({amount:this.props.minAmt,amtExceedLimit:true});
                setTimeout(()=>{
                    this.setState({amtExceedLimit:false,amount:this.props.minAmt});
                    this.props.amountChanged(this.state.amount);
                },1000)
            },200)
        } else if(amount > this.props.maxAmt){
            setTimeout(()=>{
                this.inputAmount.inputRef.value = this.props.maxAmt;
                this.setState({amtExceedLimit:true,amount:this.props.maxAmt});
                setTimeout(()=>{
                    this.setState({amtExceedLimit:false,amount:this.props.maxAmt});
                    this.props.amountChanged(this.state.amount);
                },1000)
            },200)
        } else {
                this.props.amountChanged(amount);
        }
    }
    onCheck = ()=>{
        this.props.insureSelectionChanged(this.props.name);
        this.props.amountChanged(this.state.amount);
    }
    render(){
        let limitString = "> " + this.props.minAmt + " and < " + this.props.maxAmt;
        return (<Card >
            <Card.Content textAlign={"center"}>
                {this.props.isCustomized ?
                    (
                        <Card.Header>
                            <div>Customized</div>
                            <Input ref={(inputAmount)=>{this.inputAmount = inputAmount}}
                                   style={{margin:5}} size={"mini"}
                                   type={"number"} placeholder="input your amount here"
                                   onBlur={()=>{this.amountChange()}}>
                                <input style={{textAlign:"center"}}/>
                            </Input>
                            {this.state.amtExceedLimit ?
                                <Message negative style={{fontSize:10}}>
                                    The amount should be {limitString}
                                </Message> : null
                            }
                        </Card.Header>
                    ):(
                    <Card.Header>
                        <div style={{margin:5}}>Insure for</div>
                        <div style={{margin:5}}>{this.state.amount} ETH</div>
                    </Card.Header>)}
            </Card.Content>
            <Card.Content textAlign={"center"}>
                <Card.Meta>
                    <div>
                        <span>Not late</span>
                        <Header as="h3" style={{margin:5}}>You Get {this.state.amount / 10} ETH</Header>
                    </div>
                    <div>
                        <span>Late for half an hour when arriving</span>
                        <Header as="h3" style={{margin:5}}>You Get {5 * this.state.amount} ETH</Header>
                    </div>
                    <div>
                        <span>Late for an hour when arriving</span>
                        <Header as="h3" style={{margin:5}}>You Get {10 * this.state.amount} ETH</Header>
                    </div>
                </Card.Meta>
            </Card.Content>
            <Card.Content extra style={{background:this.props.isChecked ? '#21ba45' : ''}}>
                <Checkbox checked={this.props.isChecked} label='Select' style={{margin:10}}
                onChange={(event,element)=>{if(element.checked){this.onCheck()}}}/>
            </Card.Content>
        </Card>)
    }
}
InsureCard.defaultProps = {
    isChecked:false,
    amount:0.01,
    isCustomized:false,
    amountChanged:()=>{},
    insureSelectionChanged:()=>{}
}