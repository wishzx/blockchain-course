include "./mimc.circom";

/*
 * IfThenElse sets `out` to `true_value` if `condition` is 1 and `out` to
 * `false_value` if `condition` is 0.
 *
 * It enforces that `condition` is 0 or 1.
 *
 */
template IfThenElse() {
    signal input condition;
    signal input true_value;
    signal input false_value;
    signal output out;

    // TODO
    // Hint: You will need a helper signal...

    condition * (1 - condition) === 0;

    signal partialOutput;

    partialOutput <== condition * true_value;

    out <== partialOutput +  (1 - condition) * false_value;



}

/*
 * SelectiveSwitch takes two data inputs (`in0`, `in1`) and produces two ouputs.
 * If the "select" (`s`) input is 1, then it inverts the order of the inputs
 * in the ouput. If `s` is 0, then it preserves the order.
 *
 * It enforces that `s` is 0 or 1.
 */
template SelectiveSwitch() {
    signal input in0;
    signal input in1;
    signal input s;
    signal output out0;
    signal output out1;

    // TODO
    s * (1- s ) === 0;

    component ite_0 = IfThenElse();

    ite_0.condition <== s ;
    ite_0.true_value <== in1;
    ite_0.false_value <== in0;


    component ite_1 = IfThenElse();

    ite_1.condition <== s;
    ite_1.true_value <== in0;
    ite_1.false_value <== in1;

    out0 <== ite_0.out;
    out1 <== ite_1.out;


}

/*
 * Verifies the presence of H(`nullifier`, `nonce`) in the tree of depth
 * `depth`, summarized by `digest`.
 * This presence is witnessed by a Merle proof provided as
 * the additional inputs `sibling` and `direction`, 
 * which have the following meaning:
 *   sibling[i]: the sibling of the node on the path to this coin
 *               at the i'th level from the bottom.
 *   direction[i]: "0" or "1" indicating whether that sibling is on the left.
 *       The "sibling" hashes correspond directly to the siblings in the
 *       SparseMerkleTree path.
 *       The "direction" keys the boolean directions from the SparseMerkleTree
 *       path, casted to string-represented integers ("0" or "1").
 */
template Spend(depth) {
    signal input digest;
    signal input nullifier;
    signal private input nonce;
    signal private input sibling[depth];
    signal private input direction[depth];

    component hash = Mimc2();

    hash.in0 <== nullifier;
    hash.in1 <== nonce;

    component partial_proof[depth];
    component switch[depth];
    var temp = hash.out;
    for (var i = 0; i < depth; ++i) {

        switch[depth] = SelectiveSwitch();
        switch[depth].in0 <== temp;
        switch[depth].in1 <== sibling[depth];
        switch[depth].s <== direction[depth];
        


        partial_proof[depth] = Mimc2();

        partial_proof[depth].in0 <== switch[depth].out0;
        partial_proof[depth].in1 <== switch[depth].out1;
        temp = partial_proof[depth].out;

    }

    digest === temp;
}

component main = Spend(10);
