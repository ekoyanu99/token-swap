import React from "react";
import Logo from "../assets/logo.svg";
import Matic from "../assets/matic-logo.svg";
import Ox from "../assets/0x-logo.svg";
import Inch from "../assets/1inch-logo.svg";
import { Link } from "react-router-dom";

function Header(props) {

  const {address, isConnected, connect} = props;

  return (
    <header>
      <div className="leftH">
        <img src={Logo} alt="logo" className="logo" />
        <Link to="/OxProtocol" className="link">

          <div className="headerItem">
            <img src={Ox} alt="0x" className="eth" />
            0x Protocol
          </div>
        </Link>
        <Link to="/" className="link">
          <div className="headerItem">
            <img src={Inch} alt="1inch" className="eth" />
            1Inch
          </div>
        </Link>
        <Link to="/tokens" className="link">
          <div className="headerItem">Tokens</div>
        </Link>
      </div>
      <div className="rightH">
        <div className="headerItem">
          <img src={Matic} alt="matic" className="eth" />
          Polygon
        </div>
        <div className="connectButton" onClick={connect}>
          {isConnected ? (address.slice(0,4) +"..." +address.slice(38)) : "Connect"}
        </div>
      </div>
    </header>
  );
}

export default Header;
