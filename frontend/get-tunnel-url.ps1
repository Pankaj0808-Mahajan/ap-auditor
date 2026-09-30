$process = Start-Process -FilePath "ssh" -ArgumentList "-o StrictHostKeyChecking=no -R 80:localhost:3000 nokey@localhost.run" -RedirectStandardOutput "tunnel-url.txt" -RedirectStandardError "tunnel-err.txt" -PassThru -NoNewWindow
Write-Host "Started SSH tunnel, PID: $($process.Id)"
Start-Sleep -Seconds 12
Get-Content "tunnel-url.txt"
Get-Content "tunnel-err.txt"
Wait-Process -Id $process.Id
