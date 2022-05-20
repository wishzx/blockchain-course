from sys import exit
from bitcoin.core.script import *
from bitcoin.wallet import CBitcoinSecret

from lib.utils import *
from lib.config import (my_private_key, my_public_key, my_address,
                    faucet_address, network_type)
from Q1 import send_from_P2PKH_transaction


cust1_private_key = CBitcoinSecret(
    'cP8eM553JA6Tir9rEoC5Q1j9a7AvwcMEcYdEywHLF61EeH3WkmmX')
cust1_public_key = cust1_private_key.pub
cust2_private_key = CBitcoinSecret(
    'cQiDcRzjeeJtJYqw6iMt8YQWQNfUsDium2xYqNWTjDkAuaSbCofZ')
cust2_public_key = cust2_private_key.pub
cust3_private_key = CBitcoinSecret(
    'cS4oAMtarLvKTGt8nbTiV8wZNWMHZzWjdFxRkCzMQpck8YDtp6ye')
cust3_public_key = cust3_private_key.pub



######################################################################
# TODO: Complete the scriptPubKey implementation for Exercise 3

# You can assume the role of the bank for the purposes of this problem
# and use my_public_key and my_private_key in lieu of bank_public_key and
# bank_private_key.

Q3a_txout_scriptPubKey = [
        1 ,cust1_public_key, cust2_public_key, cust3_public_key, 3 ,  OP_CHECKMULTISIGVERIFY , OP_DUP ,OP_HASH160 , my_address ,OP_EQUALVERIFY ,OP_CHECKSIG
]
######################################################################

if __name__ == '__main__':
    ######################################################################
    # TODO: set these parameters correctly
    amount_to_send = 0.0001125 - 0.00001 # amount of BTC in the output you're sending minus fee
    txid_to_spend = (
        '9771d90efaeb94e69017d23be22a5d7eeb5bcae2f229d14447cfd4d57163afc8')
    utxo_index = 4 # index of the output you are spending, indices start at 0
    ######################################################################

    response = send_from_P2PKH_transaction(amount_to_send, txid_to_spend, 
        utxo_index, Q3a_txout_scriptPubKey, my_private_key, network_type)
    print(response.status_code, response.reason)
    print(response.text)
