import ipfshttpclient
import io

with ipfshttpclient.connect() as client:
    with open('/home/avita/Downloads/image.png', 'rb') as image:

        # import pdb; pdb.set_trace()
        # files = [
        #     {

        #         'image.jpg': image.read()
            
        #     }
        # ]
        try:
            dir_ = client.files.mkdir('/images')
        except:
            pass
        img = client.files.write('/images/image.png', io.BytesIO(image.read()),create=True)
        print(client.files.stat('/images'))
        # print(dir_)

        # client.files.write()

        # print(client.add(*files, pin=True))
        print(img)
