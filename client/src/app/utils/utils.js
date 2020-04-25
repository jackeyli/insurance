import _ from 'lodash';
export const wait= (time)=>{return new Promise((resolve,reject)=>{
    setTimeout(()=>{
        resolve();
    },time * 1000);
})}
const _waitForEvent = async function(contract,event,filter,fromBlock,gap,totalWaitSeconds,tolerance) {
    if(totalWaitSeconds > tolerance) {
        throw "No Response";
    }
    let evts = (await contract.getPastEvents(event,{fromBlock: fromBlock,toBlock: 'latest'}))
        .filter((t)=>{
            return filter(t);
        });
    if(evts.length > 0){
        return evts[0];
    } else {
        await wait(gap);
        return _waitForEvent(contract,event,filter,fromBlock,gap,totalWaitSeconds + gap,tolerance);
    }
}
export const waitForEvent = async (contract,event,filter,fromBlock,gap,tolerance) => {
    return await _waitForEvent(contract,event,filter,fromBlock,gap,0,tolerance);
}
export const callMethod = async(methodCall,params)=>{
    let _estimatedGas = await methodCall.estimateGas(params);
    return await methodCall.send(_.merge(params,{gas:Math.max(200000,Math.ceil(_estimatedGas * 1.2))}));
}
Number.prototype.trunc = function(precision){
    let numPart =  Math.floor(Math.abs(this)),
        precPart = +(Math.abs(this) - numPart).toFixed(precision + 2),
        plusMinus = this > 0 ? 1 : (-1);
    return plusMinus * (numPart + Math.floor(precPart * Math.pow(10,precision)) / Math.pow(10,precision));
}
Number.prototype.toFixedNoZero = function(precision){
    let str = this.toFixed(precision);
    while((str.indexOf('.') >= 0 && str.endsWith("0")) || str.endsWith(".")){
        str = str.substr(0,str.length - 1);
    }
    return str;
}