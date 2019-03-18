const wait= (time)=>{return new Promise((resolve,reject)=>{
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