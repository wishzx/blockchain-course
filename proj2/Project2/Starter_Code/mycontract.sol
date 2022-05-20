// Please paste your contract's solidity code here
// Note that writing a contract here WILL NOT deploy it and allow you to access it from your client
// You should write and develop your contract in Remix and then, before submitting, copy and paste it here


// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.7;


contract Splitwise {
    event IOU(address debtor,address creditor, uint32 amount);
    // debtor adress => creditor adress => amount owned
    mapping(address => mapping( address => uint32)) private balance;


    function lookup(address debtor, address creditor) public view returns (uint32 ret){
    return balance[debtor][creditor];
    }

    
    function add_IOU(uint32 amount, address creditor) public {
        require(amount > 0);
        require(creditor != msg.sender, "you are trying to IOU yourself lOL");
        uint32 previous_amount = balance[msg.sender][creditor];
        require(previous_amount + amount > previous_amount, "overflow");
        balance[msg.sender][creditor] = previous_amount + amount;

        emit IOU(msg.sender,creditor,amount);

    }
    
    function add_IOU(uint32 amount, address creditor, address[] calldata _addresses ) public {
        require(amount > 0);

        require(creditor != msg.sender);
        address[] memory addresses= _addresses;
        require(addresses.length < 10);
        require(addresses[0]==msg.sender);
        require(addresses[1]==creditor);

        uint32[] memory amounts =new uint32[](addresses.length);
        uint32 max = 0 ;

        uint32 previous_amount = balance[msg.sender][creditor];
        require(previous_amount + amount > previous_amount, "overflow");
        balance[msg.sender][creditor] = previous_amount + amount;

        for (uint i=0; i<addresses.length; i++) {
            if (i== addresses.length-1) {
                amounts[i] = balance[addresses[i]][msg.sender];

            } else {
                amounts[i] = balance[addresses[i]][addresses[i+1]];
            }

            require(amounts[i] > 0, "fake cycle");
            if (amounts[i] > max){
                max = amounts[i];
            }
            
        }
        for (uint i=0; i<addresses.length; i++) {
            if (i== addresses.length-1) {
                balance[addresses[i]][msg.sender] = balance[addresses[i]][msg.sender] - max;


            } else {
                balance[addresses[i]][addresses[i+1]] = balance[addresses[i]][addresses[i+1]]- max;

            }
        }


        emit IOU(msg.sender,creditor,amount);

    }
    
}
