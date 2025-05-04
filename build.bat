@echo off
chcp 65001
rmdir /s /q dist\Center
rmdir /s /q dist\Gateway
rmdir /s /q dist\Scanner
rmdir /s /q dist\Parser
mkdir dist
mkdir dist\Center
mkdir dist\Gateway
mkdir dist\Scanner
mkdir dist\Parser
cls


xcopy /E /I /Y Gateway .\\dist\\Gateway\\
xcopy /E /I /Y Scanner .\\dist\\Scanner\\
xcopy /E /I /Y Parser .\\dist\\Parser\\
cd dist
del mparser_backup.sql
for /r %%i in (__pycache__) do rmdir /s /q "%%i" >nul 2>&1
cd ..
rmdir /s /q dist\Gateway\logs
rmdir /s /q dist\Scanner\logs
rmdir /s /q dist\Parser\logs
mkdir dist\Gateway\logs
mkdir dist\Scanner\logs
mkdir dist\Parser\logs
cd Center

rem MySQL 容器密码： gmcc@123，请自行修改

yarn build && cd ..\dist && docker exec -e MYSQL_PWD=gmcc@123 m-mysql mysqldump -u root mparser > mparser_backup.sql

