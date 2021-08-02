from rest_framework import serializers
from rest_framework.exceptions import ValidationError
import filetype
class IPFSInpuSerializer(serializers.Serializer):
    name = serializers.CharField(required=True)
    description = serializers.CharField(required=True)
    attachment = serializers.FileField(required=True)
    gif = serializers.FileField(allow_null=True)

    def validate(self,data):
        print(data)
        attachment = data['attachment'].file

        attachment_type = filetype.guess(attachment)

        # validate if uploaded file is image
        if attachment_type.mime.startswith('image'):
            data['gif']=None
            return data
        # Validate if gif is uploaded with video file.
        elif attachment_type.mime.startswith('video'):
            gif = data.get('gif')
            if not gif:
                raise ValidationError(
                    {'gif': "Gif file is required with video upload."}
                )
            else:
                gif_type = filetype.guess(gif)
                if gif_type.mime.startswith('image') \
                and gif_type.extension.lower() == 'gif':
                    return data
                else:
                    raise ValidationError(
                        {'gif': "Only Gif file can be uploaded with video"}
                    )
        else:
            raise ValidationError(
                {'attahment': "Only image and videos are allowed."}
            )
    # /dns4/ipfs.io/tcp/443/https
    # ipfs config Addresses.Gateway /dns6/dweb.link/tcp/443/https