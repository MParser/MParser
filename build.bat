@echo off
rmdir /s /q dist
mkdir dist
mkdir dist\Center
mkdir dist\Gateway
mkdir dist\Scanner
mkdir dist\Parser
xcopy /E /I /Y Gateway\dist .\\dist\\Gateway\\
xcopy /E /I /Y Scanner\dist .\\dist\\Scanner\\
xcopy /E /I /Y Parser\dist .\\dist\\Parser\\
cd dist
for /r %%i in (__pycache__) do rmdir /s /q "%%i"
cd ..
cd Center
yarn build
cd ..




