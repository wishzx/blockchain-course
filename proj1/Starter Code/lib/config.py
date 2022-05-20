from bitcoin import SelectParams
from bitcoin.base58 import decode
from bitcoin.core import x
from bitcoin.wallet import CBitcoinAddress, CBitcoinSecret, P2PKHBitcoinAddress


SelectParams('testnet')

faucet_address = CBitcoinAddress('mv4rnyY3Su5gjcDNzbMLKBQkBicCtHUtFB')

# For questions 1-3, we are using 'btc-test3' network. For question 4, you will
# set this to be either 'btc-test3' or 'bcy-test'
network_type = 'btc-test3'


######################################################################
# This section is for Questions 1-3
# TODO: Fill this in with your private key.
#
# Create a private key and address pair in Base58 with keygen.py
# Send coins at https://testnet-faucet.mempool.co/

my_private_key = CBitcoinSecret(
    'cU5bVTTXcoWiL1RKxjZM4fTP7uLejJMhv5NDLaU9SWXafarSTSbg')
#mshZK6vnNdWDgwMaUCvUsya5VhAfqmUyfZ
my_public_key = my_private_key.pub
my_address = P2PKHBitcoinAddress.from_pubkey(my_public_key)
#
# TxID 5944adc70590f72158303900b79a1ab35d894dfe27ba06bfdc0e35bdb4a4ac2d

######################################################################


######################################################################
# NOTE: This section is for Question 4
# TODO: Fill this in with address secret key for BTC testnet3
#
# Create address in Base58 with keygen.py
# Send coins at https://testnet-faucet.mempool.co/

# Only to be imported by alice.py
# Alice should have coins!!
alice_secret_key_BTC = CBitcoinSecret(
    'cViyeMzryEDJfmE54jSpEkHo7uzo6otBnq45nwarA4x8mihapeT5')
#815821294b818cfc1904f835d14968fb345d49a87c97a738e9968e90c00fc871
# Only to be imported by bob.py
bob_secret_key_BTC = CBitcoinSecret(
    'cSDpvdAXviYDKDcnz6A99FkRAgQn3ez4nXihAeFaA79Fw6vGAbgq')

# Can be imported by alice.py or bob.py
alice_public_key_BTC = alice_secret_key_BTC.pub
alice_address_BTC = P2PKHBitcoinAddress.from_pubkey(alice_public_key_BTC)
#mmAX8FsXcWzPWYgdwSzYfsmhWwGwCiPtwp
bob_public_key_BTC = bob_secret_key_BTC.pub
bob_address_BTC = P2PKHBitcoinAddress.from_pubkey(bob_public_key_BTC)
######################################################################


######################################################################
# NOTE: This section is for Question 4
# TODO: Fill this in with address secret key for BCY testnet
#
# Create address in hex with
# curl -X POST https://api.blockcypher.com/v1/bcy/test/addrs?token=YOURTOKEN
# This request will return a private key, public key and address. Make sure to save these.
# my token = 3f1cc5da535e4b93ab740f5222018241
# Send coins with
# curl -d '{"address": "BCY_ADDRESS", "amount": 1000000}' https://api.blockcypher.com/v1/bcy/test/faucet?token=YOURTOKEN
# This request will return a transaction reference. Make sure to save this.

# Only to be imported by alice.py
alice_secret_key_BCY = CBitcoinSecret.from_secret_bytes(
    x('fcb1b481592697ecb32dad488a6d5752f8acc15f972da2c59ee5bc3b6366feb7'))

# Only to be imported by bob.py
# Bob should have coins!!
bob_secret_key_BCY = CBitcoinSecret.from_secret_bytes(
    x('d7af99fb279853a47d350ba74ee84139631f47c1c9cbca4a832a10a549e03da3'))
#bob coins tx hash 15f37b327d6289e19c77f764e43f3d6fc2d42fa22bef07e509472a7505be417b
# Can be imported by alice.py or bob.py
alice_public_key_BCY = alice_secret_key_BCY.pub
alice_address_BCY = P2PKHBitcoinAddress.from_pubkey(alice_public_key_BCY)

bob_public_key_BCY = bob_secret_key_BCY.pub
bob_address_BCY = P2PKHBitcoinAddress.from_pubkey(bob_public_key_BCY)
######################################################################
