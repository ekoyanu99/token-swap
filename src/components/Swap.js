import React, { useState, useEffect } from "react";
import { Input, Popover, Radio, Modal, message } from "antd";
import {
  ArrowDownOutlined,
  DownOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import tokenList from "../tokenList.json";
import axios from "axios";
import { erc20ABI, useSendTransaction, useWaitForTransaction, useContractWrite } from "wagmi";
import { errors, ethers } from 'ethers';
import * as qs from 'qs';

function Swap(props) {
  const { address, isConnected } = props;
  const [messageApi, contextHolder] = message.useMessage();
  const [slippage, setSlippage] = useState(2.5);
  const [tokenOneAmount, setTokenOneAmount] = useState(null);
  const [tokenTwoAmount, setTokenTwoAmount] = useState(null);
  const [tokenOne, setTokenOne] = useState(tokenList[0]);
  const [tokenTwo, setTokenTwo] = useState(tokenList[1]);
  const [isOpen, setIsOpen] = useState(false);
  const [changeToken, setChangeToken] = useState(1);
  const [prices, setPrices] = useState(null);
  const [txDetails, setTxDetails] = useState({
    to: null,
    data: null,
    value: null,
  });

  const { data, sendTransaction } = useSendTransaction({
    request: {
      from: address,
      to: String(txDetails.to),
      data: String(txDetails.data),
      value: String(txDetails.value),
    }
  })

  // const { approvalData, isLoading, isSuccess, write } = useContractWrite({
  //   address: tokenOneAddress,
  //   abi: erc20ABI,
  //   functionName: 'approve',
  // });

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  })

  function handleSlippageChange(e) {
    setSlippage(e.target.value);
  }

  function changeAmount(e) {
    setTokenOneAmount(e.target.value);

    const ratio = prices.buyAmount / 10 ** tokenTwo.decimals;

    if (e.target.value && prices) {
      setTokenTwoAmount((e.target.value * ratio).toFixed(8))
    } else {
      setTokenTwoAmount(null);
    }
  }

  function switchTokens() {
    setPrices(null);
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
    const one = tokenOne;
    const two = tokenTwo;
    setTokenOne(two);
    setTokenTwo(one);
    fetchPrices(two.address, one.address);
  }

  function openModal(asset) {
    setChangeToken(asset);
    setIsOpen(true);
  }

  function modifyToken(i) {
    setPrices(null);
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
    if (changeToken === 1) {
      setTokenOne(tokenList[i]);
      fetchPrices(tokenList[i].address, tokenTwo.address)
    } else {
      setTokenTwo(tokenList[i]);
      fetchPrices(tokenOne.address, tokenList[i].address)
    }
    setIsOpen(false);
  }

  async function fetchPrices() {
    console.log("Getting Price");

    const params = {
      sellToken: tokenOne.address,
      buyToken: tokenTwo.address,
      sellAmount: 1 * 10 ** tokenOne.decimals,
    };

    const apiUrl = `https://polygon.api.0x.org/swap/v1/price?` + new URLSearchParams(params);
    const res = await fetch(apiUrl);
    const data = await res.json();

    setPrices(data);
    console.log(tokenOne.ticker, "to", tokenTwo.ticker, ", pilih lagi jika belum sesuai. Terimakasih!")
  }

  async function fetchQuote(account) {
    console.log("Getting Quote");

    let amount = tokenOneAmount * 10 ** tokenOne.decimals;
    console.log("amount get quote", amount);

    const paramQuotes = {
      sellToken: tokenOne.address,
      buyToken: tokenTwo.address,
      sellAmount: amount,
      takerAddress: account,
    };

    const response = await fetch(`https://polygon.api.0x.org/swap/v1/quote?${qs.stringify(paramQuotes)}`);

    let swapQuoteJSON = await response.json();
    return swapQuoteJSON;

  }


  async function fetchDexSwap() {

    const erc20abi = [{ "inputs": [{ "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "symbol", "type": "string" }, { "internalType": "uint256", "name": "max_supply", "type": "uint256" }], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "burn", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "burnFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "subtractedValue", "type": "uint256" }], "name": "decreaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "addedValue", "type": "uint256" }], "name": "increaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }]

    let accounts = await window.ethereum.request({ method: "eth_accounts" });
    console.log("Accounts: ", accounts);
    let takerAddress = accounts[0];
    console.log("takerAddress: ", takerAddress);
    const swapQuoteJSON = await fetchQuote(takerAddress);
    console.log("swapQuoteJSON: ", swapQuoteJSON);

    // Allowance
    // Set Token Allowance
    // Interact with the ERC20TokenContract
    // REVIEW: Verify ethers.Contract parameters...
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const ERC20TokenContract = new ethers.Contract(tokenOne.address, erc20abi, signer);
    console.log(errors)
    // const ERC20TokenContract = new ethers.Contract(erc20abi, fromTokenAddress);
    console.log("Setup ERC20TokenContract: ", ERC20TokenContract);

    const maxApproval = ethers.constants.MaxUint256;
    console.log("maxApproval: ", maxApproval);

    // let approveSwap = await ERC20TokenContract.connect(takerAddress).approve(swapQuoteJSON.allowanceTarget, maxApproval).then(console.log("Approved"));
    ERC20TokenContract.methods.approve(
      swapQuoteJSON.allowanceTarget,
      maxApproval,
    )
      .send({ from: takerAddress })
      .then(tx => {
        console.log("tx: ", tx)
      });

    // Perform the swap
    await setTxDetails(swapQuoteJSON);

    console.log(txDetails);

    console.log("Swap transaction complete");

  }


  useEffect(() => {

    fetchPrices(tokenList[0].address, tokenList[1].address)

  }, [])

  useEffect(() => {

    if (txDetails.to && isConnected) {
      sendTransaction();
    }
  }, [txDetails])

  useEffect(() => {

    messageApi.destroy();

    if (isLoading) {
      messageApi.open({
        type: 'loading',
        content: 'Transaction is Pending...',
        duration: 0,
      })
    }

  }, [isLoading])

  useEffect(() => {
    messageApi.destroy();
    if (isSuccess) {
      messageApi.open({
        type: 'success',
        content: 'Transaction Successful',
        duration: 1.5,
      })
    } else if (txDetails.to) {
      messageApi.open({
        type: 'error',
        content: 'Transaction Failed',
        duration: 1.50,
      })
    }


  }, [isSuccess])


  const settings = (
    <>
      <div>Slippage Tolerance</div>
      <div>
        <Radio.Group value={slippage} onChange={handleSlippageChange}>
          <Radio.Button value={0.5}>0.5%</Radio.Button>
          <Radio.Button value={2.5}>2.5%</Radio.Button>
          <Radio.Button value={5}>5.0%</Radio.Button>
        </Radio.Group>
      </div>
    </>
  );

  return (
    <>
      {contextHolder}
      <Modal
        open={isOpen}
        footer={null}
        onCancel={() => setIsOpen(false)}
        title="Select a token"
      >
        <div className="modalContent">
          {tokenList?.map((e, i) => {
            return (
              <div
                className="tokenChoice"
                key={i}
                onClick={() => modifyToken(i)}
              >
                <img src={e.img} alt={e.ticker} className="tokenLogo" />
                <div className="tokenChoiceNames">
                  <div className="tokenName">{e.name}</div>
                  <div className="tokenTicker">{e.ticker}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
      <div className="tradeBox">
        <h2>0x Dex Aggregator</h2>
        <div className="tradeBoxHeader">
          <h4>Swap</h4>
          <Popover
            content={settings}
            title="Settings"
            trigger="click"
            placement="bottomRight"
          >
            <SettingOutlined className="cog" />
          </Popover>
        </div>
        <div className="inputs">
          <Input
            placeholder="0"
            value={tokenOneAmount}
            onChange={changeAmount}
            disabled={!prices}
          />
          <Input placeholder="0" value={tokenTwoAmount} disabled={true} />
          <div className="switchButton" onClick={switchTokens}>
            <ArrowDownOutlined className="switchArrow" />
          </div>
          <div className="assetOne" onClick={() => openModal(1)}>
            <img src={tokenOne.img} alt="assetOneLogo" className="assetLogo" />
            {tokenOne.ticker}
            <DownOutlined />
          </div>
          <div className="assetTwo" onClick={() => openModal(2)}>
            <img src={tokenTwo.img} alt="assetOneLogo" className="assetLogo" />
            {tokenTwo.ticker}
            <DownOutlined />
          </div>
        </div>
        <div className="swapButton" disabled={!tokenOneAmount || !isConnected} onClick={fetchDexSwap}>Swap</div>
      </div>
    </>
  );
}

export default Swap;
