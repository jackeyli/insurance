const {waitForEvent} = require('./utils'),
    flightTest = artifacts.require('FlightTest.sol');

contract('Solidity Contract Tests', (accounts) => {


  describe(`Oraclized Flight Test`,async() =>{

      let contract = null,
          order_id = null;
      it('Should return results for checkValid',async() =>{
          contract = await flightTest.deployed();
          await contract.checkValidFlight("MU571",{
              from: accounts[1],
              gas: 200000
          });
          let block = await web3.eth.getBlock("latest");
          let {args:{sender,flightNo,result}} = await waitForEvent(contract,'LogCheckValid',block.number,5,30);
          console.log(result);
          console.log(sender);
          console.log(flightNo);
      });
      it('Should not accept price larger than balance / 5', async() =>{
          contract = await flightTest.deployed();
          await contract.send(1e17 + 1000,{from:accounts[0]});
          try {
              await contract.insure("MU571", 132320267, {
                  from: accounts[1],
                  value: 3e16,
                  gas: 2000000
              });

          } catch(e) {
              return;
          }
          assert.fail("Should not high price");
      });
     it('Should not accept too low price', async() =>{
         contract = await flightTest.deployed();
          await contract.send(2e19 + 1000,{from:accounts[0]});
          try {
              await contract.insure("MU571", 132320267, {
                  from: accounts[1],
                  value: 4e15,
                  gas: 2000000
              });
          } catch(e) {
              return;
          }
         assert.fail("accept too low price");
     });
      it('Should not accept too high price', async() =>{
          contract = await flightTest.deployed();
          try {
              await contract.insure("MU571", 132320267, {
                  from: accounts[1],
                  value: 2e19,
                  gas: 2000000
              });
          } catch(e) {
              return;
          }
          assert.fail("accept too high price");
      });
      it('Should insure ahead of time', async() =>{
          contract = await flightTest.deployed();
          let dt = new Date(new Date().getTime() + 76400000),
              dt_time = (dt.getFullYear() << 16) + ((dt.getMonth() + 1) << 8) + dt.getDate();
          try {
              await contract.insure("MU571", dt_time, {
                      from: accounts[1],
                      value: 1e17,
                      gas: 2000000
                  })
          }catch(e){
              return;
          }
          assert.fail("insure ahead of time");
      });
      it('Should store the callback object correctly ', async() =>{
          contract = await flightTest.deployed();
          const {args:{_id,flightNo,expectedDepatureDate,user,paidAmt}} =
              (await contract.insure("MU571",132320267,{from:accounts[1],value:1e17,gas:2000000})).receipt.logs[0];
          order_id = _id;
          assert.equal(flightNo,"MU571");
          assert.equal(expectedDepatureDate,"2019-12-11");
          assert.equal(user,accounts[1]);
          assert.equal(paidAmt,1e17);
      });
      it('Should compensate when delay more than an hour',async () =>{
          contract = await flightTest.deployed();
          const {args:{order_id,flightNo,expectedDepatureDate,user,paidAmt}} =
              (await contract.insureTest("MU572",132317717,"2019-02-21 16:50",
              "2019-02-21 17:55",{from:accounts[1],value:1e16,gas:2000000})).receipt.logs[0];
          await contract.claimCompensation(order_id,{from:accounts[1],gas:1200000});
          let block = await web3.eth.getBlock("latest");
          let {args:{isSuccess,amount}} = await waitForEvent(contract,'LogCompensation',block.number,5,30);
          assert.equal(isSuccess,true);
          assert.equal(amount,1e17);
      });
      it('Should compensate when delay more than half an hour',async () =>{
          contract = await flightTest.deployed();
          let {args:{order_id}} = (await contract.insureTest("MU573",132317717,"2019-02-21 16:50",
              "2019-02-21 17:25",{from:accounts[1],value:1e16,gas:2000000})).receipt.logs[0];
          await contract.claimCompensation(order_id,{from:accounts[1],gas:1200000});
          let block = await web3.eth.getBlock("latest");
          let {args:{isSuccess,amount}} = await waitForEvent(contract,'LogCompensation',block.number,5,30);
          assert.equal(isSuccess,true);
          assert.equal(amount,5e16);
      });
      it('Should not compensate when no delay',async () =>{
          contract = await flightTest.deployed();
          let {args:{order_id}} = (await contract.insureTest("MU574",132317717,"2019-02-21 17:25",
              "2019-02-21 17:25",{from:accounts[1],value:1e16,gas:2000000})).receipt.logs[0];
          await contract.claimCompensation(order_id,{from:accounts[1],gas:1200000});
          let block = await web3.eth.getBlock("latest");
          let {args: {isSuccess, amount}} = await waitForEvent(contract, 'LogCompensation', block.number, 5, 30);
          assert.equal(isSuccess,false);
      });
  })

})