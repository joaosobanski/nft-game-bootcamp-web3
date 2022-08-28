import React, { useEffect, useState } from "react";
import "./App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import SelectCharacter from "./Components/SelectCharacter";
import { CONTRACT_ADDRESS, transformCharacterData, transformOtherCharacterData } from "./constants";
import myEpicGame from "./utils/MyEpicGame.json";
import { ethers } from "ethers";
import Arena from './Components/Arena';
import LoadingIndicator from "./Components/LoadingIndicator";
// Constantes
const TWITTER_HANDLE = "JoaovSobanski";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  /*
   * Só uma variável de estado que vamos usar para armazenar a carteira pública do usuário.
   */
  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  /*
   * Já que esse método vai levar um tempo, lembre-se de declará-lo como async
   */
  useEffect(() => {
    /*
     * Quando nosso componente for montado, tenha certeza de configurar o estado de carregamento
     */
    setIsLoading(true);
    checkIfWalletIsConnected();
  }, []);
  const renderContent = () => {
    /*
     * cenário #1
     */
    if (isLoading) {
      return <LoadingIndicator />;
    }
    if (!currentAccount) {
      return (
        <div className="connect-wallet-container">
          <img
            src="https://4.bp.blogspot.com/-dEbN44n9Rw0/W7YarQVZ9DI/AAAAAAAAWK0/3FotuG67mMgAJ_r_cSjiTIrDJee5Lm02wCEwYBhgL/s1600/giphy.gif"
            alt="Nascimento Gif"
          />
          <button
            className="cta-button connect-wallet-button"
            onClick={connectWalletAction}
          >
            Conecte sua carteira para começar
          </button>
        </div>
      );
      /*
       * cenário #2
       */
    } else if (currentAccount && !characterNFT) {
      return <SelectCharacter setCharacterNFT={setCharacterNFT} />;
      /*
      * Se tiver uma carteira conectada e um personagem NFT, é hora de batalhar!
      */
    } else if (currentAccount && characterNFT) {
      return <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} />;
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Parece que você não tem a metamask instalada!");
        /*
         * Nós configuramos o isLoading aqui porque usamos o return na proxima linha
         */
        setIsLoading(false);
        return;
      } else {
        console.log("Objeto ethereum encontrado:", ethereum);

        const accounts = await ethereum.request({ method: "eth_accounts" });

        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("Carteira conectada:", account);
          setCurrentAccount(account);
        } else {
          console.log("Não foi encontrada uma carteira conectada");
        }
      }
    } catch (error) {
      console.log(error);
    }
    /*
     * Nós lançamos a propriedade de estado depois de toda lógica da função
     */
    setIsLoading(false);
  };


  /*
   * Implementa o seu método connectWallet aqui
   */
  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Instale a MetaMask!");
        return;
      }

      /*
       * Método chique para pedir acesso para a conta.
       */
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      /*
       * Boom! Isso deve escrever o endereço público uma vez que autorizarmos Metamask.
       */
      console.log("Contectado", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };
  const checkNetwork = async () => {
    try {
      console.log(window.ethereum.networkVersion)
      if (window.ethereum.networkVersion !== "4") {
        alert("Please connect to Rinkeby!");
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    checkIfWalletIsConnected();
    checkNetwork();

  }, []);

  useEffect(() => {
    console.log('aqio')
    const fetchNFTMetadata = async () => {
      console.log("Verificando pelo personagem NFT no endereço:", currentAccount)

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame,
        signer
      );

      const characterNFT = await gameContract.checkIfUserHasNFT();
      if (characterNFT.name) {
        console.log("Usuário tem um personagem NFT")
        setCharacterNFT(transformOtherCharacterData(characterNFT))
      } else {
        console.log("Nenhum personagem NFT foi encontrado")
      }

      /*
       * Uma vez que tivermos acabado a busca, configure o estado de carregamento para falso.
       */
      setIsLoading(false);
    };

    if (currentAccount) {
      console.log("Conta Atual:", currentAccount)
      fetchNFTMetadata();
    }
  }, [currentAccount]);


  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">⚔️ Batalhas no Metaverso ⚔️</p>
          <p className="sub-text">Junte-se a mim para vencer os inimigos do Metaverso!</p>

          {renderContent()}

        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`construído por @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  )
}

export default App
