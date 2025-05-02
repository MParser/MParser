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
cd Center
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /format:list') do set datetime=%%I
set migrationname=%datetime:~0,14%

rem MySQL 容器密码： gmcc@123，请自行修改

yarn prisma migrate dev --name %migrationname% && yarn prisma generate && yarn build && cd ..\dist && docker exec -e MYSQL_PWD=gmcc@123 m-mysql mysqldump -u root mparser > mparser_backup.sql



