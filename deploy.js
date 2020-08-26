const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');

const {interface, bytecode} = require('./compile.js');

const provider = new HDWalletProvider(
    METAMASK_MNEMONIC,
    RINKEBY_ENDPOINT
);

const web3 = new Web3(provider);
const deploy = async() => {
    const accounts = await web3.eth.getAccounts();
    console.log('deploying from ', accounts[0]);
    const ABI = interface;
    const deployedContract = await new web3.eth.Contract(JSON.parse(ABI))
    .deploy({data : bytecode})
    .send({
        gas : '1000000',
        from : accounts[0]
    });
    console.log('contract deployed to', deployedContract.options.address);
}

deploy();

