from slack import WebClient
client = WebClient(token="xoxb-608792699190-1710341289285-mnaYYrubPpudeYPh36rCBzpV")
user = client.users_lookupByEmail(email='yogesh.thoughtwin@gmail.com')