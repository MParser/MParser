@echo off
rem 删除dist目录
rmdir /s /q dist
cd Center
yarn build
cd ..
mkdir dist
mkdir dist\Center
mkdir dist\Gateway
mkdir dist\Scanner
mkdir dist\Parser
xcopy /E /I /Y Center\dist .\\dist\\Center\\
xcopy /E /I /Y Gateway\dist .\\dist\\Gateway\\
xcopy /E /I /Y Scanner\dist .\\dist\\Scanner\\
xcopy /E /I /Y Parser\dist .\\dist\\Parser\\
cd dist
rem 删除dist所有子目录下的python的__pycache__目录
for /r %%i in (__pycache__) do rmdir /s /q "%%i"
cd ..





