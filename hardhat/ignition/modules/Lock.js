const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const JAN_1ST_2030 = 1893456000;
const ONE_GWEI = 1_000_000_000n;

module.exports = buildModule("CertModule", (m) => {
  const cert = m.contract("Will", [["0x283918b27b3FF5F23E6Af7297d0d68140Eb81835"]]);
  return {cert};
});