del .\nodejs\prisma\schema.prisma
del .\nodejs\package.json
del .\nodejs\yarn.lock
copy ..\Center\prisma\schema.prisma .\nodejs\prisma\schema.prisma
copy ..\Center\package.json .\nodejs\package.json
copy ..\Center\yarn.lock .\nodejs\yarn.lock

del ..\dist\m-python.tar
del ..\dist\m-nodejs.tar
docker build -t m-python:latest .\python
docker build -t m-nodejs:latest .\nodejs
docker save -o ..\dist\m-python.tar m-python:latest
docker save -o ..\dist\m-nodejs.tar m-nodejs:latest
cd ..\Center
yarn none
