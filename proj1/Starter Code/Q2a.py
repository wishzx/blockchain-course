from sys import exit
from bitcoin.core.script import *

from lib.utils import *
from lib.config import (my_private_key, my_public_key, my_address,
                    faucet_address, network_type)
from Q1 import send_from_P2PKH_transaction


######################################################################
# TODO: Complete the scriptPubKey implementation for Exercise 2
Q2a_txout_scriptPubKey = [
       OP_DUP, OP_DUP, OP_ADD, 1234 , 5678 , OP_SUB ,OP_EQUALVERIFY ,OP_SUB ,5678 ,OP_EQUAL
    ]
######################################################################
#x+y = 1234  x-y = 5678  y = 1234 - 5678 / 2 = -2222    x =  3456
# x y  OP_DUP, OP_DUP, OP_ADD, 1234 , 5678 , OP_SUB ,OP_EQUALVERIFY ,OP_SUB ,5678 ,OP_EQUAL


if __name__ == '__main__':
    ######################################################################
    # TODO: set these parameters correctly
    amount_to_send = 0.0001125 - 0.00001 # amount of BTC in the output you're sending minus fee
    txid_to_spend = (
        '9771d90efaeb94e69017d23be22a5d7eeb5bcae2f229d14447cfd4d57163afc8')
    utxo_index = 3 # index of the output you are spending, indices start at 0
    ######################################################################

    response = send_from_P2PKH_transaction(
        amount_to_send, txid_to_spend, utxo_index,
        Q2a_txout_scriptPubKey, my_private_key, network_type)
    print(response.status_code, response.reason)
    print(response.text)
