import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { configureChains, chain, WagmiConfig, createClient } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { InjectedConnector } from 'wagmi/connectors/injected';
import { polygon} from 'wagmi/chains';

const { chains, provider } = configureChains(
  [polygon],
  [publicProvider()]
);

const connector = new InjectedConnector({
  chains
})

const client = createClient({
  autoConnect: true,
  provider,
  connector,
});


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <WagmiConfig client={client}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </WagmiConfig>
  </React.StrictMode>
);
