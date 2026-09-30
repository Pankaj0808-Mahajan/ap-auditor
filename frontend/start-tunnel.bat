@echo off
ssh -o StrictHostKeyChecking=no -R 80:localhost:3000 nokey@localhost.run > tunnel-url.txt 2>&1
