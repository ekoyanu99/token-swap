import React from 'react';
import Inch from "../assets/1inch-logo.svg";

function Tokens() {
  return (
        <>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img src={Inch} alt="logo" className="Token-Logo" />
                <div className='total-supply'>
                    <h1>Total Supply:
                        1,500,000,000
                    </h1>
                </div>
                <div>
                    <h2>Welcome to the 1INCH Token</h2>
                    <p className='token-info'>
                        The 1INCH token is the governance and utility token of the 1inch Network. 
                        1INCH holders can stake their tokens to participate in the 1inch Network's DAO governance, including the 1inch DAO Treasury management. 
                        Also, holders can choose resolvers and earn a part of their fees.
                    </p>
                </div>
            </div>
        </>
    )
}

export default Tokens