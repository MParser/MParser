del m-python.tar
del m-nodejs.tar
docker build -t m-python:latest .\python
docker build -t m-nodejs:latest .\nodejs
docker save -o m-python.tar m-python:latest
docker save -o m-nodejs.tar m-nodejs:latest
