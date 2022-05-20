
const web3 = new Web3("https://api.avax.network/ext/bc/C/rpc")

const main = async () => {
    const txcount = await web3.eth.getTransactionCount('0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC')
    console.log(txcount)
}

main()