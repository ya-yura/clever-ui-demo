# Простой скрипт извлечения данных

$ProgressPreference = 'SilentlyContinue'
$ServerUrl = "http://localhost:9000/MobileSMARTS/api/v1"
$OutputDir = "O:\Dev\Cleverence\proto-3\src\data\demo"

# Создать папку
New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null

Write-Host "Извлечение данных с сервера..." -ForegroundColor Cyan

# Получить DocTypes
$docTypesUrl = "$ServerUrl/DocTypes"
$docTypes = Invoke-RestMethod -Uri $docTypesUrl

# Сохранить DocTypes
$docTypesFile = Join-Path $OutputDir "doctypes.json"
$docTypes | ConvertTo-Json -Depth 10 | Out-File $docTypesFile -Encoding UTF8
Write-Host "DocTypes сохранены: найдено $($docTypes.value.Count) типов" -ForegroundColor Green

# Получить документы
$allDocs = @{}
$totalCount = 0

foreach ($docType in $docTypes.value) {
    $uni = $docType.uni
    $name = $docType.displayName
    
    Write-Host "  Извлечение: $name..." -ForegroundColor Gray
    
    $docsUrl = "$ServerUrl/Docs/$uni"
    
    try {
        $docs = Invoke-RestMethod -Uri $docsUrl -ErrorAction Stop
        
        if ($docs.value) {
            $allDocs[$uni] = $docs.value
            $count = $docs.value.Count
            $totalCount += $count
            Write-Host "    OK: $count документов" -ForegroundColor Green
        }
        else {
            $allDocs[$uni] = @()
            Write-Host "    Нет документов" -ForegroundColor Gray
        }
    }
    catch {
        $allDocs[$uni] = @()
        Write-Host "    Ошибка" -ForegroundColor Red
    }
}

# Сохранить все документы
$allDocsFile = Join-Path $OutputDir "all-documents.json"
$allDocs | ConvertTo-Json -Depth 10 | Out-File $allDocsFile -Encoding UTF8

Write-Host ""
$msg = "Готово! Всего документов: " + $totalCount
Write-Host $msg -ForegroundColor Green
$msg2 = "Папка: " + $OutputDir
Write-Host $msg2 -ForegroundColor Cyan

