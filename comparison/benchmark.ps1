# 1. Generowanie dużego tekstu (miarodajność)
$inputText = "TEST"

$iterations = 5
$csvPath = "../comparison/results.csv"
$hashTypes = "MD5", "SHA1", "SHA2"
$languages = "CSharp", "Cpp", "Python"

$exeMap = @{
    "CSharp" = @{ "SHA1"="../backend/cs/sha1.exe"; "SHA2"="../backend/cs/sha2.exe"; "MD5"="../backend/cs/md5.exe" }
    "Cpp"    = @{ "SHA1"="../backend/cpp/sha1.exe"; "SHA2"="../backend/cpp/sha2.exe"; "MD5"="../backend/cpp/md5.exe" }
    "Python" = @{ "SHA1"="../backend/python/sha1.exe"; "SHA2"="../backend/python/sha2.exe"; "MD5"="../backend/python/md5.exe" }
}

$folder = Split-Path $csvPath
if (-not (Test-Path $folder)) { New-Item -ItemType Directory -Path $folder -Force | Out-Null }
if (Test-Path $csvPath) { Remove-Item $csvPath }

foreach ($hashType in $hashTypes) {
    foreach ($lang in $languages) {
        $exePath = $exeMap[$lang][$hashType]
        Write-Host "Testuje: $hashType w $lang..." -ForegroundColor Cyan
        
        for ($i = 1; $i -le $iterations; $i++) {
            $tempOutput = [System.IO.Path]::GetTempFileName()
            $startTime = Get-Date

            $process = Start-Process -FilePath $exePath -ArgumentList "`"$inputText`"" `
                -RedirectStandardOutput $tempOutput -WindowStyle Hidden -PassThru

            $maxRAM = 0
            $maxCPU = 0

            while (-not $process.HasExited) {
                try {
                    $proc = Get-Process -Id $process.Id -ErrorAction Stop
                    if ($proc.WorkingSet64 -gt $maxRAM) { $maxRAM = $proc.WorkingSet64 }
                    $cpu = $proc.TotalProcessorTime.TotalSeconds
                    if ($cpu -gt $maxCPU) { $maxCPU = $cpu }
                } catch { break }
                # Krótki sen, by nie obciążać pętli
                Start-Sleep -Milliseconds 5 
            }

            $endTime = Get-Date
            
            # Czekamy chwilę na zwolnienie pliku przed usunięciem
            Start-Sleep -Milliseconds 50
            Remove-Item $tempOutput -ErrorAction SilentlyContinue 

            $result = [PSCustomObject]@{
                Language = $lang
                HashType = $hashType
                CPU      = [math]::Round($maxCPU, 4)
                RAM      = [math]::Round($maxRAM / 1MB, 2)
                Time     = [math]::Round(($endTime - $startTime).TotalSeconds, 4)
            }

            $result | Export-Csv -Path $csvPath -Append -NoTypeInformation
        }
    }
}
Write-Host "Gotowe! Wyniki zapisano w $csvPath" -ForegroundColor Green