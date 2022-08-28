const CONTRACT_ADDRESS = "0xFBb32A55b15866F2Bf0D5D54882C02FD5FC96EBc";
const transformCharacterData = (characterData) => {
  return {
    name: characterData.name,
    imageURI: characterData.imageURI,
    hp: characterData.hp.toNumber(),
    maxHp: characterData.maxHp.toNumber(),
    attackDamage: characterData.attackDamage.toNumber()
  };
};
const transformOtherCharacterData = (characterData) => {
  return {
    name: characterData.name,
    imageURI: characterData.imageURI,
    hp: characterData.hp.toNumber(),
    maxHp: characterData.maxHp.toNumber(),
    attackDamage: characterData.attackDamage.toNumber(),
    totalAttackDamage: characterData.totalAttackDamage.toNumber(),
  };
};

export { CONTRACT_ADDRESS, transformCharacterData, transformOtherCharacterData };
