// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Will {
    mapping(address => Inheritor[]) private inheritor_list_map;
    mapping(address=> mapping(address=>uint)) private index_LUT;
    mapping(address=> mapping(address=>uint)) private  percentage_LUT;
    mapping(address=> uint) private amount_deposited;
    
    struct Inheritor {
        address payable inheritorAddress;
        uint256 percentage; 
    }

    event InheritorAdded(address inheritor, uint256 percentage);
    event AssetsDistributed(address testator, address inheritor, uint256 amount);
    event FundsDeposited(address testator, uint amount);

    function depositFunds() external payable {
    require(msg.value > 0, "Must send some Ether");
    amount_deposited[msg.sender]+= msg.value;
    emit FundsDeposited(msg.sender,msg.value);
    }

    function withdraw_funds(uint _amount) external{
        require(amount_deposited[msg.sender]>=_amount, "Insufficient funds deposited");
        amount_deposited[msg.sender]=amount_deposited[msg.sender] -_amount;
        payable(msg.sender).transfer(_amount);

    }

   
    function modifyInheritor(address payable _inheritorAddress, uint256 _percentage) external  {
        require(_percentage > 0, "Percentage must be greater than 0.");
        require(_percentage <= 100, "Percentage cannot exceed 100.");
        uint sum=0;
        
        if(inheritor_list_map[msg.sender].length>0){
            
            for(uint i=0; i<inheritor_list_map[msg.sender].length;i++){
                sum=sum+inheritor_list_map[msg.sender][i].percentage;
            }
        }
        require(sum+_percentage-percentage_LUT[msg.sender][_inheritorAddress]<= 100, "Total percentage exceeds 100"); 
        inheritor_list_map[msg.sender][index_LUT[msg.sender][_inheritorAddress]].percentage=_percentage;
        percentage_LUT[msg.sender][_inheritorAddress]=_percentage;
        
    }

    function getInheritors() public view returns (Inheritor[] memory) {
        return inheritor_list_map[msg.sender];
    }

    function checkmaount() public view returns(uint _am){
        return amount_deposited[msg.sender];
    }
    
    function addInheritor(address payable _inheritorAddress, uint256 _percentage) external  {
        require(_percentage > 0, "Percentage must be greater than 0.");
        require(_percentage <= 100, "Percentage cannot exceed 100.");
        uint sum=0;
        
        if(inheritor_list_map[msg.sender].length>0){
            
            for(uint i=0; i<inheritor_list_map[msg.sender].length;i++){
                sum=sum+inheritor_list_map[msg.sender][i].percentage;
            }
        }
        require(sum+_percentage <= 100, "Total percentage exceeds 100"); 
        inheritor_list_map[msg.sender].push(Inheritor(_inheritorAddress, _percentage));
        percentage_LUT[msg.sender][_inheritorAddress]=_percentage;
        index_LUT[msg.sender][_inheritorAddress]=inheritor_list_map[msg.sender].length-1;
        
        }    

    receive() external payable {}

    address[] public issuers;
    mapping(address => bool) public authorizedIssuers;

    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender], "Caller is not an authorized death certificate issuer.");
        _;
    }

    event distributionFunctionstarted(address test);
    event check(uint number1, uint number2);
    function distributeAssets(address original_own) onlyAuthorizedIssuer public {
        emit distributionFunctionstarted(original_own);
        uint256 totalAssets = amount_deposited[original_own];
        emit check(inheritor_list_map[original_own].length,totalAssets);
        for (uint256 i = 0; i < inheritor_list_map[original_own].length; i++) {
            Inheritor memory inheritor = inheritor_list_map[original_own][i];
            uint256 amount = (totalAssets * inheritor.percentage) / 100;
            amount_deposited[original_own]-=amount;
            payable(inheritor.inheritorAddress).transfer(amount);
            emit AssetsDistributed(original_own, inheritor.inheritorAddress, amount);
        }
        
        
    }

    mapping(address=>bool) private transferconfirm;
    address[] private deceased;
    mapping(address=>bool) private deceasedconfirm;

    constructor(address[] memory _issuers) {
        
        for(uint i=0; i<_issuers.length; i++){
            issuers.push(_issuers[i]);
            authorizedIssuers[_issuers[i]]=true;
        }
    }
    
    event DeathCertificateIssued(address deceasedperson);
    
    function issueDeathCertificate(address _deceasedperson) onlyAuthorizedIssuer external {
        require(deceasedconfirm[_deceasedperson]==false,"The deceased person already has a death certificate");
        deceased.push(_deceasedperson);
        deceasedconfirm[_deceasedperson]=true;
        require(transferconfirm[_deceasedperson]==false,"The deceased person's assets have already been transferred");
        distributeAssets(_deceasedperson);
        transferconfirm[_deceasedperson]=true;
        emit DeathCertificateIssued(_deceasedperson);
    }
}
