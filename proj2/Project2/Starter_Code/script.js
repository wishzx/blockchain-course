
// =============================================================================
//                                  Config
// =============================================================================

let web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");

// Constant we use later
var GENESIS = '0x0000000000000000000000000000000000000000000000000000000000000000';

// This is the ABI for your contract (get it from Remix, in the 'Compile' tab)
// ============================================================
var abi = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "debtor",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "creditor",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint32",
				"name": "amount",
				"type": "uint32"
			}
		],
		"name": "IOU",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint32",
				"name": "amount",
				"type": "uint32"
			},
			{
				"internalType": "address",
				"name": "creditor",
				"type": "address"
			},
			{
				"internalType": "address[]",
				"name": "_addresses",
				"type": "address[]"
			}
		],
		"name": "add_IOU",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint32",
				"name": "amount",
				"type": "uint32"
			},
			{
				"internalType": "address",
				"name": "creditor",
				"type": "address"
			}
		],
		"name": "add_IOU",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "debtor",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "creditor",
				"type": "address"
			}
		],
		"name": "lookup",
		"outputs": [
			{
				"internalType": "uint32",
				"name": "ret",
				"type": "uint32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]; // FIXME: fill this in with your contract's ABI //Be sure to only have one array, not two

// ============================================================
abiDecoder.addABI(abi);
// call abiDecoder.decodeMethod to use this - see 'getAllFunctionCalls' for more

var contractAddress = '0x3DD6C4da5bE92242f4a574338c4F783Ea8522Ed3'; // FIXME: fill this in with your contract's address/hash
var BlockchainSplitwise = new web3.eth.Contract(abi, contractAddress);

// =============================================================================
//                            Functions To Implement
// =============================================================================

// TODO: Add any helper functions here!

// TODO: Return a list of all users (creditors or debtors) in the system
// You can return either:
//   - a list of everyone who has ever sent or received an IOU
// OR
//   - a list of everyone currently owing or being owed money
async function getUsers() {
	const userSet = new Set();
	const result = await getAllFunctionCalls(contractAddress, "add_IOU");
	// result contain an array of objects, we need the attributes "from" and "args[1]" from each of them.
	result.forEach(element => {
		userSet.add(element.from);
		userSet.add(element.args[1]);
	});
	return Array.from(userSet);

}

// TODO: Get the total amount owed by the user specified by 'user'
async function getTotalOwed(user) {
	user = user.toLowerCase();
	let totalOwed = 0;
	const result = await getAllFunctionCalls(contractAddress, "add_IOU");

	result.forEach(element => {
		if (element.args[1] === user) {
			totalOwed += parseInt(element.args[0]);
		}
		if (element.from === user) {
			totalOwed -= parseInt(element.args[0]);

		}
	});

	return totalOwed;
}

// TODO: Get the last time this user has sent or received an IOU, in seconds since Jan. 1, 1970
// Return null if you can't find any activity for the user.
// HINT: Try looking at the way 'getAllFunctionCalls' is written. You can modify it if you'd like.
async function getLastActive(user) {
	user = user.toLowerCase();
	const result = await getAllFunctionCalls(contractAddress, "add_IOU");

	for (let i = 0; i < result.length; i++) {
		const element = result[i];
		if (element.args[1] === user) {
			return element.t;
		}
		if (element.from === user) {
			return element.t;
		}
	}

	return null;
}

// TODO: add an IOU ('I owe you') to the system
// The person you owe money is passed as 'creditor'
// The amount you owe them is passed as 'amount'
async function add_IOU(creditor, amount) {
	creditor = creditor.toLowerCase();
	//check if loop will form
	const neightbourFunction = await getNeighbourFunction();

	const path = await doBFS(creditor, web3.eth.defaultAccount, neightbourFunction);

	if (path === null) {
		try {
			const result = await BlockchainSplitwise.methods.add_IOU(amount, creditor).send({ from: web3.eth.defaultAccount });

			console.log(result);

		} catch (error) {
			console.log(error);
		}
	}
	else if (path.length >= 2) {
		try {

			const result = await BlockchainSplitwise.methods.add_IOU(amount, creditor, path).send({ from: web3.eth.defaultAccount });
			console.log(result);

		} catch (error) {
			console.log(error);
		}
	}


}

async function getNeighbourFunction() {
	const all_users = await getUsers();

	return async function getNeighbors(user) {
		user = user.toLowerCase();
		var results = await Promise.all(all_users.map(async (neightbour) => {
			const amount = await BlockchainSplitwise.methods.lookup(user, neightbour).call();
			if (amount > 0) {
				return neightbour;
			}
			else {
				return null;
			}
		}));

		return results.filter(item => item != null);



	}

}
// =============================================================================
//                              Provided Functions
// =============================================================================
// Reading and understanding these should help you implement the above

// This searches the block history for all calls to 'functionName' (string) on the 'addressOfContract' (string) contract
// It returns an array of objects, one for each call, containing the sender ('from'), arguments ('args'), and the timestamp ('t')
async function getAllFunctionCalls(addressOfContract, functionName) {
	var curBlock = await web3.eth.getBlockNumber();
	var function_calls = [];

	while (curBlock !== GENESIS) {
		var b = await web3.eth.getBlock(curBlock, true);
		var txns = b.transactions;
		for (var j = 0; j < txns.length; j++) {
			var txn = txns[j];

			// check that destination of txn is our contract
			if (txn.to == null) { continue; }
			if (txn.to.toLowerCase() === addressOfContract.toLowerCase()) {
				var func_call = abiDecoder.decodeMethod(txn.input);

				// check that the function getting called in this txn is 'functionName'
				if (func_call && func_call.name === functionName) {
					var time = await web3.eth.getBlock(curBlock);
					var args = func_call.params.map(function (x) { return x.value });
					function_calls.push({
						from: txn.from.toLowerCase(),
						args: args,
						t: time.timestamp
					})
				}
			}
		}
		curBlock = b.parentHash;
	}
	return function_calls;
}

// We've provided a breadth-first search implementation for you, if that's useful
// It will find a path from start to end (or return null if none exists)
// You just need to pass in a function ('getNeighbors') that takes a node (string) and returns its neighbors (as an array)
async function doBFS(start, end, getNeighbors) {

	var queue = [[start]];
	while (queue.length > 0) {
		var cur = queue.shift();
		var lastNode = cur[cur.length - 1]

		if (lastNode.toLowerCase() === end.toLowerCase()) {
			return cur;
		} else {
			var neighbors = await getNeighbors(lastNode);
			for (var i = 0; i < neighbors.length; i++) {
				queue.push(cur.concat([neighbors[i]]));
			}
		}
	}

	return null;
}

// =============================================================================
//                                      UI
// =============================================================================

// This sets the default account on load and displays the total owed to that
// account.
web3.eth.getAccounts().then((response) => {
	web3.eth.defaultAccount = response[0];

	getTotalOwed(web3.eth.defaultAccount).then((response) => {
		$("#total_owed").html("$" + response);
	});

	getLastActive(web3.eth.defaultAccount).then((response) => {
		time = timeConverter(response)
		$("#last_active").html(time)
	});
});

// This code updates the 'My Account' UI with the results of your functions
$("#myaccount").change(function () {
	web3.eth.defaultAccount = $(this).val();

	getTotalOwed(web3.eth.defaultAccount).then((response) => {
		$("#total_owed").html("$" + response);
	})

	getLastActive(web3.eth.defaultAccount).then((response) => {
		time = timeConverter(response)
		$("#last_active").html(time)
	});
});

// Allows switching between accounts in 'My Account' and the 'fast-copy' in 'Address of person you owe
web3.eth.getAccounts().then((response) => {
	var opts = response.map(function (a) {
		return '<option value="' +
			a.toLowerCase() + '">' + a.toLowerCase() + '</option>'
	});
	$(".account").html(opts);
	$(".wallet_addresses").html(response.map(function (a) { return '<li>' + a.toLowerCase() + '</li>' }));
});

// This code updates the 'Users' list in the UI with the results of your function
getUsers().then((response) => {
	$("#all_users").html(response.map(function (u, i) { return "<li>" + u + "</li>" }));
});

// This runs the 'add_IOU' function when you click the button
// It passes the values from the two inputs above
$("#addiou").click(function () {
	web3.eth.defaultAccount = $("#myaccount").val(); //sets the default account
	add_IOU($("#creditor").val(), $("#amount").val()).then((response) => {
		window.location.reload(true); // refreshes the page after add_IOU returns and the promise is unwrapped
	})
});

// This is a log function, provided if you want to display things to the page instead of the JavaScript console
// Pass in a discription of what you're printing, and then the object to print
function log(description, obj) {
	$("#log").html($("#log").html() + description + ": " + JSON.stringify(obj, null, 2) + "\n\n");
}


// =============================================================================
//                                      TESTING
// =============================================================================

// This section contains a sanity check test that you can use to ensure your code
// works. We will be testing your code this way, so make sure you at least pass
// the given test. You are encouraged to write more tests!

// Remember: the tests will assume that each of the four client functions are
// async functions and thus will return a promise. Make sure you understand what this means.

function check(name, condition) {
	if (condition) {
		console.log(name + ": SUCCESS");
		return 3;
	} else {
		console.log(name + ": FAILED");
		return 0;
	}
}

async function sanityCheck() {
	console.log("\nTEST", "Simplest possible test: only runs one add_IOU; uses all client functions: lookup, getTotalOwed, getUsers, getLastActive");

	var score = 0;

	var accounts = await web3.eth.getAccounts();
	web3.eth.defaultAccount = accounts[0];

	var users = await getUsers();
	score += check("getUsers() initially empty", users.length === 0);

	var owed = await getTotalOwed(accounts[0]);
	score += check("getTotalOwed(0) initially empty", owed === 0);

	var lookup_0_1 = await BlockchainSplitwise.methods.lookup(accounts[0], accounts[1]).call({ from: web3.eth.defaultAccount });
	score += check("lookup(0,1) initially 0", parseInt(lookup_0_1, 10) === 0);

	var response = await add_IOU(accounts[1], "10");

	users = await getUsers();
	score += check("getUsers() now length 2", users.length === 2);

	owed = await getTotalOwed(accounts[0]);
	score += check("getTotalOwed(0) now 10", owed === 10);

	lookup_0_1 = await BlockchainSplitwise.methods.lookup(accounts[0], accounts[1]).call({ from: web3.eth.defaultAccount });
	score += check("lookup(0,1) now 10", parseInt(lookup_0_1, 10) === 10);

	var timeLastActive = await getLastActive(accounts[0]);
	var timeNow = Date.now() / 1000;
	var difference = timeNow - timeLastActive;
	score += check("getLastActive(0) works", difference <= 60 && difference >= -3); // -3 to 60 seconds

	console.log("Final Score: " + score + "/21");
}

//sanityCheck(); Uncomment this line to run the sanity check when you first open index.html
