const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const {interface, bytecode} = require('../compile');

let contest;
let accounts;

// use ganache to create mock account
// send mock transactions

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    contest = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({data : bytecode})
    .send({from: accounts[0], gas: '1000000'});
});

describe('LuckyDraw Contract', () => {
    it('can deploy a contract', () => {
        assert.ok(contest.options.address);
    });
    // an account should be able to enter our contract
    it('can allow an account to enter',async() => {
        await contest.methods.registration('name','999999','name@gmail.com')
        .send({
                from : accounts[0],
                value : web3.utils.toWei('0.02','ether'),   
                gas : '1000000' 
            });

        const addresses = await contest.methods.getParticipants().call({
            from : accounts[0]
        });
        assert.equal(accounts[0], addresses[0]);
    });

    it('requires a min amount of ether to enter luckydraw', async()=> {
        try {
            await contest.methods.enter().send({
                from : accounts[0],
                value : 200
            })
            assert(false);
        }
        catch(error) {
            assert(error);
        }
    });

    it('allow multiple accounts in luckydraw', async() => {
        await contest.methods.registration('name','999999','name@gmail.com')
        .send({
                from : accounts[0],
                value : web3.utils.toWei('0.02','ether'),   
                gas : '1000000' 
            });
        
        await contest.methods.registration('name1','9899999','name1@gmail.com')
        .send({
                from : accounts[1],
                value : web3.utils.toWei('0.02','ether'),   
                gas : '1000000' 
            });
        
        await contest.methods.registration('name2','9799999','name2@gmail.com')
        .send({
                from : accounts[2],
                value : web3.utils.toWei('0.02','ether'),   
                gas : '1000000' 
            });

        const participants = await contest.methods.getParticipants().call({
            from : accounts[0]
        });

        assert.equal(accounts[0], participants[0])
        assert.equal(accounts[1], participants[1])
        assert.equal(accounts[2], participants[2])
    });

    it('only manager can pick winner', async()=>{
        try {
            await contest.methods.pickWinner().send({
                from: accounts[1]
            });
            assert(false);
        }
        catch (error) {
            assert(error);
        }
    });

    it('send the winner prize', async()=> {
        await contest.methods.registration('name1','9899999','name1@gmail.com')
        .send({
                from : accounts[1],
                value : web3.utils.toWei('0.02','ether'),   
                gas : '1000000' 
            });

        const initialAccountBalance = await web3.eth.getBalance(accounts[1]);
        await contest.methods.pickWinner().send({from : accounts[0]});
        await contest.methods.transferAmount().send({
            from : accounts[0], 
            value : web3.utils.toWei('0.04', 'ether')
        });
        const finalAccountBalance = await web3.eth.getBalance(accounts[1]);
        assert(finalAccountBalance > initialAccountBalance);
        const contestBalance = await web3.eth.getBalance(contest.options.address);
        assert(contestBalance == 0); 
        // we are not having any logic yet in the code to make contestBalance as 0 
    });
});
