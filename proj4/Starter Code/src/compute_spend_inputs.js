const { docopt } = require("docopt");
const { mimc2 } = require("./mimc.js");
const { SparseMerkleTree } = require("./sparse_merkle_tree.js");
const fs = require("fs");
const doc = `Usage:
  compute_spend_inputs.js [options] <depth> <transcript> <nullifier>
  compute_spend_inputs.js -h | --help

Options:
  -o <file>     name of the created witness file [default: input.json]
  -h --help     Print this message

Arguments:
   <depth>       The number of non-root layers in the merkle tree.
   <transcript>  The file containing transcript of all coins.
                 A file with a line for each coin.
                 Each coin is either a single number (the coin
                 itself) or it can be two space-separated number, which are, in
                 order, the nullifier and the nonce for the coin.

                 Example:

                     1839475893
                     1984375234 2983475298
                     3489725451 9834572345
                     3452345234

   <nullifier>   The nullifier to print a witness of validity for.
                 Must be present in the transcript.
`

/*
 * Computes inputs to the Spend circuit.
 *
 * Inputs:
 *   depth: the depth of the merkle tree being used.
 *   transcript: A list of all coins added to the tree.
 *               Each item is an array.
 *               If the array has one element, then that element is the coin.
 *               Otherwise the array will have two elements, which are, in order:
 *                 the nullifier and
 *                 the nonce
 *               This list will contain **no** duplicate nullifiers or coins.
 *   nullifier: The nullifier to print inputs to validity verifier for.
 *              This nullifier will be one of the nullifiers in the transcript.
 *
 * Return:
 *   an object of the form:
 * {
 *   "digest"            : ...,
 *   "nullifier"         : ...,
 *   "nonce"             : ...,
 *   "sibling[0]"        : ...,
 *   "sibling[1]"        : ...,
 *      ...
 *   "sibling[depth-1]"  : ...,
 *   "direction[0]"      : ...,
 *   "direction[1]"      : ...,
 *      ...
 *   "direction[depth-1]": ...,
 * }
 * where each ... is a string-represented field element (number)
 * notes about each:
 *   "digest": the digest for the whole tree after the transcript is
 *                  applied.
 *   "nullifier": the nullifier for the coin being spent.
 *   "nonce": the nonce for that coin
 *   "sibling[i]": the sibling of the node on the path to this coin
 *                 at the i'th level from the bottom.
 *   "direction[i]": "0" or "1" indicating whether that sibling is on the left.
 *       The "sibling" hashes correspond directly to the siblings in the
 *       SparseMerkleTree path.
 *       The "direction" keys the boolean directions from the SparseMerkleTree
 *       path, casted to string-represented integers ("0" or "1").
 */
function computeInput(depth, transcript, nullifier) {
  // create empty tree
  const tree = new SparseMerkleTree(depth);
  let nonce;
  let digest;
  let coin_to_spend;
  // fill the tree with coins and find nonce corresponding to nullifier
  transcript.forEach(e => {
    if (e.length == 2) {
      if (e[0] == nullifier) {
        nonce = e[1];
        coin_to_spend = mimc2(e[0], e[1]);
        tree.insert(coin_to_spend);
      }
      else {
        tree.insert(mimc2(e[0], e[1]));
      }
    }
    else {
      tree.insert(e[0]);
    }
  });
  if (nonce == undefined) console.log("Nullifier provided as input was not present in transcript, so nonce was undefined");


  // root hash
  digest = tree.node(0, 0);
  // get the directions of nullifier (which is the ith coin)
  console.log(tree.leaf_indices);
  const directions = tree.path(coin_to_spend);

  //create the object in the form requested and return it
  let obj = {
    "digest": digest,
    "nullifier": nullifier,
    "nonce": nonce,
  };

  for (let i = 0; i < directions.length; i++) {
    const e = directions[i];
    obj[`sibling[${i}]`] = e[0];
    obj[`direction[${i}]`] = e[1] === true ? "1" : "0";
  }
  return obj;
}

module.exports = { computeInput };

// If we're not being imported
if (!module.parent) {
  const args = docopt(doc);
  const transcript =
    fs.readFileSync(args['<transcript>'], { encoding: 'utf8' })
      .split(/\r?\n/)
      .filter(l => l.length > 0)
      .map(l => l.split(/\s+/));
  const depth = parseInt(args['<depth>']);
  const nullifier = args['<nullifier>'];
  const input = computeInput(depth, transcript, nullifier);
  fs.writeFileSync(args['-o'], JSON.stringify(input) + "\n");
}
