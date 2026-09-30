@echo off
echo Installing pgvector into PostgreSQL 17...
copy /Y "e:\Projects\FYP\slops backend\temp_pgvector\lib\vector.dll" "C:\Program Files\PostgreSQL\17\lib\"
copy /Y "e:\Projects\FYP\slops backend\temp_pgvector\share\extension\vector*" "C:\Program Files\PostgreSQL\17\share\extension\"
echo.
echo pgvector files successfully installed!
pause
