from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import APIException
from decimal import Decimal
from django.conf import settings
import ccxt

# Create your views here.
class SpendingView(APIView):
    
    def get(self, request, *args, **kwargs):
        
        # Get request params
        params = request.query_params

        # Validate params
        if 'side' not in params.keys() or 'amount' not in params.keys():
            raise APIException('"side" and "amount" parameters are required.')

        side = params['side']
        amount = params['amount']

        # validate side
        if side not in ['SELL','BUY']:
            raise APIException('side must be either "SELL" or "BUY".')

        # validate amount
        try:
            amount = Decimal(amount)
        except Exception as e:
            raise APIException('Invalid Amount')

        # Generate calculations
        token_pair = 'BTC/USDT'
        hitbtc = ccxt.hitbtc()
        bitcoin_ticker = hitbtc.fetch_ticker(token_pair)
        usdt_required = Decimal(bitcoin_ticker['ask']) * amount

        # Generate response.
        data = {
            'side': side,
            'amount': amount,
            'usdt_required': usdt_required
        }

        return Response(data=data)
