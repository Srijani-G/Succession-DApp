import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { WillABI, contractAddress } from './Will.json';
import './App.css'
const CONTRACT_ADDRESS = contractAddress;

function WelcomePage() {
  const [account, setAccount] = useState(null); // Store the user's account
  const [message, setMessage] = useState("");  // Store connection status message

  // Function to connect to MetaMask
  const connectWallet = async () => {
    
    try {
      // Check if window.ethereum is available (MetaMask)
      if (!window.ethereum) {
        setMessage("MetaMask is required.");
        return;
      }

      // Request account connection
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      // Set the connected account
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await (signer).getAddress();
      setAccount(signer.address); // Set account after successful connection
      setMessage(`Connected to MetaMask with address: ${address}`);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
    
  };

  return (
    <div className="welcome-page">
      <div className="welcome-container">
      <div className="logo-container">
        <img src="Dapp_logo2.png" alt="App Logo" className="logo" />
      </div>
      <div className="app-details">
        <h1 className="app-name">Succession</h1>
        <p className="tagline">"Secure Your Legacy: Powered by Blockchain."</p>
      </div>
    </div>
      <h1 style={{ textAlign: 'center' }}>Welcome to Succession</h1>
      
      <p style={{ color: 'black'}}>What would you like to do today?</p>

      {/* Show the connect wallet button if not connected */}
      {!account ? (
        <div>
          <button className="button-29"onClick={connectWallet}>Connect to MetaMask</button>
        </div>
        
        
      ) : (
        <div>
          <p style={{ color: 'black'}}>Connected</p>
        </div>
      )}

      {/* Display the message */}
      {message && <p style={{ color: 'black'}}>{message}</p>}

      <div className="options">
        <Link to="/add-inheritor">
          <button>Add Inheritor</button>
        </Link>
        <Link to="/modify-inheritor">
          <button>Modify Inheritor</button>
        </Link>
        <Link to="/check-balance">
          <button>Check Balance</button>
        </Link>
        <Link to="/issue-certificate">
          <button>Issue Death Certificate</button>
        </Link>
        <Link to="/deposit-funds">
          <button>Deposit Funds</button>
        </Link>
        <Link to="/withdraw-funds">
          <button>Withdraw Funds</button>
        </Link>
        <Link to="/get-inheritors">
          <button>View Inheritors</button>
        </Link>
      </div>
    </div>
  );
}

function ViewInheritorsPage() {
  const [inheritors, setInheritors] = useState([]);
  const [message, setMessage] = useState("");

  async function view() {
    
      try {
        if (!window.ethereum) {
          setMessage("MetaMask is required.");
          return;
        }
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, WillABI, signer);

        // Fetch the list of inheritors from the contract
        const inheritorList = await contract.getInheritors();
        // If the data returned is a tuple, map it to an object with inheritorAddress and percentage
      const parsedInheritors = inheritorList.map((item) => ({
        inheritorAddress: item[0], // Assuming item[0] is the address
        percentage: item[1].toString(), // Assuming item[1] is the percentage, convert it to string for display
      }));

      setInheritors(parsedInheritors);
        
      } catch (error) {
        setMessage(`Error: ${error.message}`);
      }
    
    }
    
  return (
    <div className="action">
      <h3 style={{ textAlign: 'center' }}>Inheritors List</h3>
      <button onClick={view}>View your inheritors and their percentages</button>
      {message && <p>{message}</p>}
      <ul>
        {inheritors.map((inheritor, index) => (
          <li key={index}>
            <p>Address: {inheritor.inheritorAddress}</p>
            <p>Percentage: {inheritor.percentage}%</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DepositFundsPage() {
  const [depositAmount, setDepositAmount] = useState("");
  const [message, setMessage] = useState("");

  async function depositFunds() {
    try {
      if (!window.ethereum) {
        setMessage("MetaMask is required.");
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, WillABI, signer);

      const tx = await contract.depositFunds({
        value: (depositAmount)
      });
      await tx.wait();
      setMessage("Funds deposited successfully.");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  }

  return (
    <div className="action">
      <h3 style={{ textAlign: 'center' }}>Deposit Funds</h3>
      <input
        type="number"
        placeholder="Amount to deposit (wei)"
        value={depositAmount}
        onChange={(e) => setDepositAmount(e.target.value)}
      />
      <button onClick={depositFunds}>Deposit</button>
      {message && <p>{message}</p>}
    </div>
  );
}

function WithdrawFundsPage() {
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [message, setMessage] = useState("");

  async function withdrawFunds() {
    try {
      if (!window.ethereum) {
        setMessage("MetaMask is required.");
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, WillABI, signer);

      const tx = await contract.withdraw_funds((withdrawAmount));
      await tx.wait();
      setMessage("Funds withdrawn successfully.");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  }

  return (
    <div className="action">
      <h3 style={{ textAlign: 'center' }}>Withdraw Funds</h3>
      <input
        type="number"
        placeholder="Amount to withdraw (wei)"
        value={withdrawAmount}
        onChange={(e) => setWithdrawAmount(e.target.value)}
      />
      <button onClick={withdrawFunds}>Withdraw</button>
      {message && <p>{message}</p>}
    </div>
  );
}

function AddInheritorPage() {
  const [inheritorAddress, setInheritorAddress] = useState("");
  const [percentage, setPercentage] = useState("");
  const [message, setMessage] = useState("");

  async function addInheritor() {
    try {
      if (!window.ethereum) {
        setMessage("MetaMask is required.");
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, WillABI, signer);

      const tx = await contract.addInheritor(inheritorAddress, (percentage));
      await tx.wait();
      setMessage("Inheritor added successfully.");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  }

  return (
    <div className="action">
      <h3 style={{ textAlign: 'center' }}>Add Inheritor</h3>
      <input
        type="text"
        placeholder="Inheritor Address"
        value={inheritorAddress}
        onChange={(e) => setInheritorAddress(e.target.value)}
      />
      <input
        type="number"
        placeholder="Percentage"
        value={percentage}
        onChange={(e) => setPercentage(e.target.value)}
      />
      <button onClick={addInheritor}>Add Inheritor</button>
      {message && <p>{message}</p>}
    </div>
  );
}

function ModifyInheritorPage() {
  const [inheritorAddress, setInheritorAddress] = useState("");
  const [percentage, setPercentage] = useState("");
  const [message, setMessage] = useState("");

  async function modifyInheritor() {
    try {
      if (!window.ethereum) {
        setMessage("MetaMask is required.");
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, WillABI, signer);

      const tx = await contract.modifyInheritor(inheritorAddress, (percentage));
      await tx.wait();
      setMessage("Inheritor modified successfully.");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  }

  return (
    <div className="action">
      <h3 style={{ textAlign: 'center' }}>Modify Inheritor</h3>
      <input
        type="text"
        placeholder="Inheritor Address"
        value={inheritorAddress}
        onChange={(e) => setInheritorAddress(e.target.value)}
      />
      <input
        type="number"
        placeholder="Percentage"
        value={percentage}
        onChange={(e) => setPercentage(e.target.value)}
      />
      <button onClick={modifyInheritor}>Modify Inheritor</button>
      {message && <p>{message}</p>}
    </div>
  );
}

function CheckBalancePage() {
  const [balance, setBalance] = useState("0");

  
    async function fetchBalance() {
      try {
        if (!window.ethereum) {
          alert("MetaMask is required.");
          return;
        }
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, WillABI, signer);

        const userBalance = await contract.checkmaount();
        const x=userBalance.toString();
        setBalance((x));
        console.log(balance);
      } catch (error) {
        console.error(error);
      }
    }
    
  return (
    <div className="action">
      <h3 style={{ textAlign: 'center' }}>View the amount you have deposited</h3>
      <button onClick={fetchBalance}>View Balance</button>
      <p>You have deposited {balance} wei</p>
    </div>
  );
}


function IssueCertificatePage() {
  const [deceasedAddress, setDeceasedAddress] = useState("");
  const [message, setMessage] = useState("");

  async function issueCertificate() {
    try {
      if (!window.ethereum) {
        setMessage("MetaMask is required.");
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, WillABI, signer);

      const tx = await contract.issueDeathCertificate(deceasedAddress);
      await tx.wait();
      setMessage("Death certificate issued successfully.");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  }

  return (
    <div className="action">
      <h3 style={{ textAlign: 'center' }}>Issue Death Certificate</h3>
      <input
        type="text"
        placeholder="Deceased Address"
        value={deceasedAddress}
        onChange={(e) => setDeceasedAddress(e.target.value)}
      />
      <button onClick={issueCertificate}>Issue Certificate</button>
      {message && <p>{message}</p>}
    </div>
  );
}



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/add-inheritor" element={<AddInheritorPage />} />
        <Route path="/modify-inheritor" element={<ModifyInheritorPage />} />
        <Route path="/check-balance" element={<CheckBalancePage />} />
        <Route path="/issue-certificate" element={<IssueCertificatePage />} />
        <Route path="/deposit-funds" element={<DepositFundsPage />} />
        <Route path="/withdraw-funds" element={<WithdrawFundsPage />} />
        <Route path="/get-inheritors" element={<ViewInheritorsPage/>} />
      </Routes>
    </Router>
  );
}

export default App;


