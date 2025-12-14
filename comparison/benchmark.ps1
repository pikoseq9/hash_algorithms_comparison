param (
    [string]$inputText,
    [ValidateSet("SHA1","SHA2","MD5")]
    [string]$hashType = "SHA1",
    [ValidateSet("CSharp","Cpp","Python")]
    [string]$lang = "CSharp"
)

# Mapowanie język + hash -> plik/skrypt
$exeMap = @{
    "CSharp" = @{ "SHA1"="../backend/cs/sha1.exe"; "SHA2"="../backend/cs/sha2.exe"; "MD5"="../backend/cs/md5.exe" }
    "Cpp"    = @{ "SHA1"="../backend/cpp/sha1.exe"; "SHA2"="../backend/cpp/sha2.exe"; "MD5"="../backend/cpp/md5.exe" }
    "Python" = @{ "SHA1"="../backend/python/sha1.exe"; "SHA2"="../backend/python/sha2.exe"; "MD5"="../backend/python/md5.exe" }
}

$exePath = $exeMap[$lang][$hashType]

# Tymczasowy plik na stdout
$tempOutput = [System.IO.Path]::GetTempFileName()

# Start czasu
$startTime = Get-Date

# Start procesu
$process = Start-Process `
    -FilePath $exePath `
    -ArgumentList "`"$inputText`"" `
    -RedirectStandardOutput $tempOutput `
    -PassThru

# Monitorowanie RAM i CPU
$maxRAM = 0
$maxCPU = 0

while (-not $process.HasExited) {
    try {
        $proc = Get-Process -Id $process.Id -ErrorAction Stop

        # RAM
        if ($proc.WorkingSet64 -gt $maxRAM) {
            $maxRAM = $proc.WorkingSet64
        }

        # CPU (TotalProcessorTime)
        $cpu = $proc.TotalProcessorTime.TotalSeconds
        if ($cpu -gt $maxCPU) {
            $maxCPU = $cpu
        }
    } catch {
        break
    }

    Start-Sleep -Milliseconds 20
}

$process.WaitForExit()
$endTime = Get-Date

# Odczyt stdout
$hash = (Get-Content $tempOutput | Out-String).Trim()
Remove-Item $tempOutput

# Statystyki
$duration = ($endTime - $startTime).TotalSeconds
$ramMB    = [math]::Round($maxRAM / 1MB, 2)
$cpuTime  = [math]::Round($maxCPU, 4)

# Obiekt wynikowy
$result = [PSCustomObject]@{
    Language = $lang
    HashType = $hashType
    File     = $exePath
    Input    = $inputText
    Hash     = $hash
    CPU_s    = $cpuTime
    RAM_MB   = $ramMB
    Time_s   = [math]::Round($duration, 4)
}

# CSV
$csvPath = "../comparison/results.csv"
$folder  = Split-Path $csvPath

if (-not (Test-Path $folder)) {
    New-Item -ItemType Directory -Path $folder -Force | Out-Null
}

$retryCount = 0
$maxRetries = 5

while ($retryCount -lt $maxRetries) {
    try {
        $result | Export-Csv -Path $csvPath -Append -NoTypeInformation
        break
    } catch {
        Start-Sleep -Milliseconds 100
        $retryCount++
        if ($retryCount -eq $maxRetries) { throw }
    }
}

# Zwrócenie hash do frontend
Write-Output $hash
