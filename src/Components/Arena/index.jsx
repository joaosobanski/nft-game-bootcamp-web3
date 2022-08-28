import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, transformCharacterData, transformOtherCharacterData } from "../../constants";
import myEpicGame from "../../utils/MyEpicGame.json";
import "./Arena.css";
import LoadingIndicator from '../LoadingIndicator'
/*
 * Passamos os metadados do nosso personagem NFT para que podemos ter um card legal na nossa UI
 */
const Arena = ({ characterNFT, setCharacterNFT }) => {
  // estado 
  const [gameContract, setGameContract] = useState(null);
  const [players, setPlayers] = useState([]);
  /*
   * Estado que vai segurar os metadados do boss
   */
  const [boss, setBoss] = useState(null);
  const [attackState, setAttackState] = useState("");
  const [showToast, setShowToast] = useState(false); 

  // UseEffects
  useEffect(() => {
    const fetchBoss = async () => {
      const bossTxn = await gameContract.getBigBoss();
      console.log('Boss:', bossTxn);
      setBoss(transformCharacterData(bossTxn));
    };

    const fetchPlayers = async () => {
      setPlayers([]);
      const playersTxn = await gameContract.getAllPlayers();
          console.log('players:', playersTxn);  
      playersTxn.forEach(i => {  
        let newPlayer = transformOtherCharacterData(i);
        if(newPlayer.maxHp > 0)
        setPlayers(oldArray => [...oldArray, newPlayer] )
      })  
    };

    /*
    * Configura a lógica quando esse evento for disparado
    */
    const onAttackComplete = (newBossHp, newPlayerHp) => {
        onAttackUpdateBossPlayer(newBossHp, newPlayerHp);
        fetchPlayers();
      
    }
    const onAttackUpdateBossPlayer = (newBossHp, newPlayerHp) => {
      const bossHp = newBossHp.toNumber();
      const playerHp = newPlayerHp.toNumber();
      console.log(newBossHp, newPlayerHp)

      console.log(`AttackComplete: Boss Hp: ${bossHp} Player Hp: ${playerHp}`);

      /*
      * Atualiza o hp do boss e do player
      */
      setBoss((prevState) => {
        return { ...prevState, hp: bossHp };
      });

      setCharacterNFT((prevState) => {
        return { ...prevState, hp: playerHp };
      });
    };

    if (gameContract) { 
      fetchBoss();
      fetchPlayers();
      gameContract.on('AttackComplete', onAttackComplete); 
    }

    /*
    * Tem certeza de limpar esse evento quando componente for removido
    */
    return () => {
      if (gameContract) {
        gameContract.off('AttackComplete', onAttackComplete);
      }
    }
  }, [gameContract]);
  const runAttackAction = async () => {
    try {
      if (gameContract) {
        setAttackState('attacking');
        console.log('Atacando o Boss...');
        const txn = await gameContract.attackBoss();
        await txn.wait();
        console.log(txn);
        setAttackState('hit');

        /*
        * Configura seu estado toast para true e depois Falso 5 segundos depois
        */
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      console.error('Erro ao atacar o boss:', error);
      setAttackState('');
    }
  };

  // UseEffects
  useEffect(() => {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame,
        signer
      );

      setGameContract(gameContract);
    } else {
      console.log("Objeto Ethereum não encontrado");
    }
  }, []);
 

  return (<div className="arena-container">
    {/* Add your toast HTML right here */}
    {boss && characterNFT && (
      <div id="toast" className={showToast ? "show" : ""}>
        <div id="desc">{`💥 ${boss.name} tomou ${characterNFT.attackDamage} de dano!`}</div>
      </div>
    )}

    {/* Boss */}
    {boss && (
      <div className="boss-container">
        <div className={`boss-content  ${attackState}`}>
          <h2>🔥 {boss.name} 🔥</h2>
          <div className="image-content">
            <img src={boss.imageURI} alt={`Boss ${boss.name}`} />
            <div className="health-bar">
              <progress value={boss.hp} max={boss.maxHp} />
              <p>{`${boss.hp} / ${boss.maxHp} HP`}</p>
            </div>
          </div>
        </div>
        <div className="attack-container">
          <button className="cta-button" onClick={runAttackAction}>
            {`💥 Atacar ${boss.name}`}
          </button>
        </div>
        {attackState === "attacking" && (
          <div className="loading-indicator">
            <LoadingIndicator />
            <p>Atacando ⚔️</p>
          </div>
        )}
      </div>
    )}

    {/* Personagem NFT */}
    {characterNFT && (
      <div className="players-container">
        <div className="player-container">
          <h2>Your Character</h2>
          <div className="player">
            <div className="image-content">
              <h2>{characterNFT.name}</h2>
              <img
                src={characterNFT.imageURI}
                alt={`Personagem ${characterNFT.name}`}
              />
              <div className="health-bar">
                <progress value={characterNFT.hp} max={characterNFT.maxHp} />
                <p>{`${characterNFT.hp} / ${characterNFT.maxHp} HP`}</p>
              </div>
            </div>
            <div className="stats">
              <h4>{`⚔️ Dano de Ataque: ${characterNFT.attackDamage}`}</h4>
            </div>
          </div>
        </div>
        <div className="active-players">
          <h2>Active Players</h2>
           { 
              players.map((item) => 
                <div key={item.characterIndex}>
                  <div className="player">
                    <div className="image-content">
                      <h2>{item.name}</h2>
                      <img
                        src={item.imageURI}
                        alt={`Personagem ${item.name}`}
                      />
                      <div className="health-bar">
                        <progress value={item.hp} max={item.maxHp} />
                        <p>{`${item.hp} / ${item.maxHp} HP`}</p>
                      </div>
                    </div>
                    <div className="stats">
                      <h4>{`⚔️ Dano de Ataque: ${item.attackDamage}`}</h4>
                    </div>
                    <div className="stats">
                      <h4>{`⚔️ Dano Total causado: ${item.totalAttackDamage}`}</h4>
                    </div> 
                  </div>
                </div>
               )
            }
        </div> 
      </div>
    )}
  </div>
  );
}

export default Arena;
