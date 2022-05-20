from bitcoin.core.script import *

######################################################################
# These functions will be used by Alice and Bob to send their respective
# coins to a utxo that is redeemable either of two cases:
# 1) Recipient provides x such that hash(x) = hash of secret
#    and recipient signs the transaction.
# 2) Sender and recipient both sign transaction
#
# TODO: Fill these in to create scripts that are redeemable by both
#       of the above conditions.
# See this page for opcode documentation: https://en.bitcoin.it/wiki/Script

# This is the ScriptPubKey for the swap transaction
def coinExchangeScript(public_key_sender, public_key_recipient, hash_of_secret):
    return [
       public_key_recipient, OP_CHECKSIGVERIFY, 0, OP_EQUAL, OP_IF, OP_HASH160, hash_of_secret, OP_EQUAL, OP_ELSE, public_key_sender, OP_CHECKSIG, OP_ENDIF
    ]


# This is the ScriptSig that the receiver will use to redeem coins
def coinExchangeScriptSig1(sig_recipient, secret):
    return [
        secret , 0 , sig_recipient
    ]

# This is the ScriptSig for sending coins back to the sender if unredeemed
def coinExchangeScriptSig2(sig_sender, sig_recipient):
    return [
        sig_sender, 1 , sig_recipient
    ]
######################################################################

######################################################################
#
# Configured for your addresses
#
# TODO: Fill in all of these fields
#

alice_txid_to_spend     = "60722ae3ec888451242ace48f071f63f8a9fce0860c4180a22d44e655571bd3d"
alice_utxo_index        = 1
alice_amount_to_send    = 0.0001125

bob_txid_to_spend       = "abd8190a3cbdcc587cba4cbfce6dcddacc327d6cc7c8aebb51bc455305fe0233"
bob_utxo_index          = 1
bob_amount_to_send      = 0.001125

# Get current block height (for locktime) in 'height' parameter for each blockchain (will be used in swap.py):
#  curl https://api.blockcypher.com/v1/btc/test3
btc_test3_chain_height  = 2132450

#  curl https://api.blockcypher.com/v1/bcy/test
bcy_test_chain_height   = 80150

# Parameter for how long Alice/Bob should have to wait before they can take back their coins
# alice_locktime MUST be > bob_locktime
alice_locktime = 5
bob_locktime = 3

tx_fee = 0.00001

# While testing your code, you can edit these variables to see if your
# transaction can be broadcasted succesfully.
broadcast_transactions = True
alice_redeems = True

######################################################################
