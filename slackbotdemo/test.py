import os
from slack import WebClient
import json
user_id = 'U01DV9SRPD5'
client = WebClient(token="xoxb-608792699190-1710341289285-mnaYYrubPpudeYPh36rCBzpV")
# user = client.users_lookupByEmail(email='yogesh.thoughtwin@gmail.com')
# print(user,'\n\n\n\n\n')
# response = client.conversations_open(users=[user['user']['id'],], message='hi')
# print(response)
# response = client.conversations_open(users=['U01DV9SRPD5'])
# response = client.conversations_list(types='private_channel')
# response = client.conversations
# print(json.dumps(response.data,indent=4))
print(client.chat_postMessage(channel='GP8KKM724', text='new test message'))
# client.chat_scheduleMessage(channel=user_id,post_at=)
# print(client.conversations_history(channel='D01LWJ3NSJ1'))
# print(client.conversations_replies(channel='D01LWJ3NSJ1',ts='1612449042.000500')['messages'][0].keys())
# print(client.conversations_replies(channel='D01LWJ3NSJ1',ts='1612449042.000500')['messages'][0]['latest_reply'])
# for channel in client.conversations_list()['channels']:
#     print(channel['id'],channel['name'])