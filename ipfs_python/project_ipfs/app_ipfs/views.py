from django.shortcuts import render
from .serializers import IPFSInpuSerializer
from rest_framework.viewsets import ViewSet, GenericViewSet
from rest_framework.views import APIView
from rest_framework.response import Response
import ipfshttpclient
from ipfshttpclient.exceptions import ConnectionError
from rest_framework.exceptions import APIException
import tempfile
import asyncio
import json
import filetype

# from ipfs_storage import InterPlanetaryFileSystemStorage

# Create your views here.


class IPFSInputViewSet(APIView):
    serializer_class = IPFSInpuSerializer
    
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data = request.data)

        if serializer.is_valid(raise_exception=True):
            try:
                ipfs_client = ipfshttpclient.connect('/ip4/127.0.0.1/tcp/5001/http')
            except ConnectionError:
                raise APIException(
                    "IPFS daemon is not running, Please contact adminstator."
                )

            # with tempfile.TemporaryDirectory(prefix='File',suffix='Upload') as temp_dir:
            # attachment = serializer.validated_data['attachment'].file
            uploads = []
            if serializer.validated_data['gif']:
                animation = tempfile.NamedTemporaryFile(dir=temp_dir, suffix='.mp4')
                animation.name = 'animation.mp4'
                # # import pdb; pdb.set_trace()

                # animation.write(
                #     serializer.validated_data['attachment'].file.read()
                # )
                # animation.
                # gif = tempfile.NamedTemporaryFile(dir=temp_dir, suffix='.gif')
                # gif.name = 'image.gif'
                # gif.write(serializer.validated_data['gif'].file.read())
                # uploads = [animation.read(), gif.read()]
                uploads = [serializer.validated_data['gif'].file, serializer.validated_data['attachment'].file]
            else:
                # attachment = serializer.validated_data['attachment'].file
                # import pdb; pdb.set_trace()
                # image = tempfile.NamedTemporaryFile(suffix='.' + serializer.validated_data['attachment'].extension)
                # image.name = 'image'+ serializer.validated_data['attachment'].extension
                # image.write(attachment.file.read())
                serializer.validated_data['attachment']._name = 'image.png'
                uploads = [serializer.validated_data['attachment'].file]
                # uploads = [image,]
            res = ipfs_client.add(*uploads, wrap_with_directory=True, pin=True)
            # import pdb; pdb.set_trace()
            data = {
                "name" : serializer.validated_data['name'],
                "description" : serializer.validated_data['description'],
                "image" : f"ipfs://ipfs/{ res[-1].get('Hash') }/{ res[0].get('Name') }",
                "external_url"  : f"localhost:8080/ipfs/{ res[-1].get('Hash') }/{ res[0].get('Name') }",
                "attributes" : [ response.as_json() for response in res ]
                }
            res = ipfs_client.add_json(data)
            print(serializer.data)

        return Response(res)