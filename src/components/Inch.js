import React, { useState, useEffect } from "react";
import { Input, Popover, Radio, Modal, message } from "antd";
import {
    ArrowDownOutlined,
    DownOutlined,
    SettingOutlined,
} from "@ant-design/icons";
import tokenList from "../tokenList.json";
import axios, { all } from "axios";
import { erc20ABI, useSendTransaction, useWaitForTransaction, useContractWrite } from "wagmi";
import { errors, ethers } from 'ethers';
import * as qs from 'qs'

function Inch(props) {
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
    const [allowance, setAllowance] = useState(null);

    const { data, sendTransaction } = useSendTransaction({
        request: {
            from: address,
            to: String(txDetails.to),
            data: String(txDetails.data),
            value: String(txDetails.value),
        }
    })

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

    async function fetchDexSwap() {

        const allowance = await axios.get(`https://api.1inch.io/v5.0/137/approve/allowance?tokenAddress=${tokenOne.address}&walletAddress=${address}`)

        // if (allowance.data.allowance === "0") {
        //     setAllowance(allowance.data.allowance);
        //     await approveToken();
        //     return
        // }
        // const decimalsMultiplier = 10 ** tokenOne.decimals;
        // const amountInteger = Math.floor(tokenOneAmount * decimalsMultiplier).toString();

        // const tx = await axios.get(
        //     `https://api.1inch.io/v5.0/137/swap?fromTokenAddress=${tokenOne.address}&toTokenAddress=${tokenTwo.address}&amount=${amountInteger}&fromAddress=${address}&slippage=${slippage}`
        // );

        // const decimals = 10 ** tokenTwo.decimals;
        // const tokenTwoAmount = (Number(tx.data.toTokenAmount) / decimals).toFixed(8);
        // setTokenTwoAmount(tokenTwoAmount);

        // setTxDetails(tx.data.tx);

        if (allowance.data.allowance === "0") {
            setAllowance(allowance.data.allowance);
            console.log(allowance);
            await approveToken();
            return;
        } else {
            setAllowance(allowance.data.allowance);
            console.log(allowance);
            console.log("Token has already been approved");
            const decimalsMultiplier = 10 ** tokenOne.decimals;
            const amountInteger = Math.floor(tokenOneAmount * decimalsMultiplier).toString();

            const tx = await axios.get(
                `https://api.1inch.io/v5.0/137/swap?fromTokenAddress=${tokenOne.address}&toTokenAddress=${tokenTwo.address}&amount=${amountInteger}&fromAddress=${address}&slippage=${slippage}`
            );

            const decimals = 10 ** tokenTwo.decimals;
            const tokenTwoAmount = (Number(tx.data.toTokenAmount) / decimals).toFixed(8);
            setTokenTwoAmount(tokenTwoAmount);

            setTxDetails(tx.data.tx);
            return;
        }
    }

    async function approveToken() {
        const approve = await axios.get(
            `https://api.1inch.io/v5.0/137/approve/transaction?tokenAddress=${tokenOne.address}`
        );

        setTxDetails(approve.data);
        console.log("not approved");
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
                        if (e.address === tokenOne.address) {
                            return null; // Skip rendering the selected token
                        }
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
                <h2>1Inch Dex Aggregator</h2>
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
                {/* <div className="swapButton" disabled={!tokenOneAmount || !isConnected} onClick={fetchDexSwap}>Swap</div> */}
                <div className="swapButton" disabled={!tokenOneAmount || !isConnected} onClick={fetchDexSwap}>
                    {allowance === "0" ? (
                        <div className="approveButton" onClick={approveToken}>
                            Approve
                        </div>
                    ) : (
                        "Swap"
                    )}
                </div>

            </div>
        </>
    );
}

export default Inch;
