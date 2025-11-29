# === Скрипт извлечения данных с сервера ===
# Извлекает DocTypes и документы с Mobile SMARTS сервера

param(
    [string]$ServerUrl = "http://localhost:9000/MobileSMARTS/api/v1",
    [string]$OutputDir = "O:\Dev\Cleverence\proto-3\src\data\demo"
)

$ProgressPreference = 'SilentlyContinue'
$ErrorActionPreference = 'Continue'

# Создаём папку для демо-данных
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Извлечение данных с сервера Mobile SMARTS                     ║" -ForegroundColor Cyan
Write-Host "╠════════════════════════════════════════════════════════════════╣" -ForegroundColor Cyan
Write-Host "║  Сервер: $ServerUrl" -ForegroundColor Cyan
Write-Host "║  Выходная папка: $OutputDir" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# 1. Извлечь DocTypes
Write-Host "[1/2] Извлечение типов документов (DocTypes)..." -ForegroundColor Yellow
try {
    $docTypesResponse = Invoke-RestMethod -Uri "$ServerUrl/DocTypes" -Method Get -ContentType "application/json"
    $docTypesFile = Join-Path $OutputDir "doctypes.json"
    $docTypesResponse | ConvertTo-Json -Depth 10 | Out-File $docTypesFile -Encoding UTF8
    Write-Host "  ✅ DocTypes сохранены: $docTypesFile" -ForegroundColor Green
    Write-Host "  📊 Найдено типов документов: $($docTypesResponse.value.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "  ❌ Ошибка получения DocTypes: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. Извлечь документы для каждого типа
Write-Host ""
Write-Host "[2/2] Извлечение документов для каждого типа..." -ForegroundColor Yellow

$totalDocs = 0
$documentsData = @{}

foreach ($docType in $docTypesResponse.value) {
    $uni = $docType.uni
    $displayName = $docType.displayName
    
    Write-Host "  📄 $displayName ($uni)..." -ForegroundColor Gray
    
    try {
        # Получить список документов
        $docsUrl = "$ServerUrl/Docs/$uni"
        $docsResponse = Invoke-RestMethod -Uri $docsUrl -Method Get -ContentType "application/json"
        
        $docCount = 0
        if ($docsResponse.value) {
            $docCount = $docsResponse.value.Count
            $documentsData[$uni] = $docsResponse.value
        }
        else {
            $documentsData[$uni] = @()
        }
        
        $totalDocs += $docCount
        
        if ($docCount -gt 0) {
            Write-Host "     ✅ Найдено документов: $docCount" -ForegroundColor Green
        }
        else {
            Write-Host "     ⚪ Документов нет" -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "     ❌ Ошибка: $($_.Exception.Message)" -ForegroundColor Red
        $documentsData[$uni] = @()
    }
}

# 3. Сохранить все документы в один файл
Write-Host ""
Write-Host "[3/3] Сохранение данных..." -ForegroundColor Yellow

$allDataFile = Join-Path $OutputDir "all-documents.json"
$documentsData | ConvertTo-Json -Depth 10 | Out-File $allDataFile -Encoding UTF8
Write-Host "  ✅ Все документы сохранены: $allDataFile" -ForegroundColor Green

# 4. Создать индекс
$index = @{
    extractedAt = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss")
    serverUrl = $ServerUrl
    docTypesCount = $docTypesResponse.value.Count
    totalDocuments = $totalDocs
    docTypes = @{}
}

foreach ($docType in $docTypesResponse.value) {
    $uni = $docType.uni
    $count = if ($documentsData[$uni]) { $documentsData[$uni].Count } else { 0 }
    $index.docTypes[$uni] = @{
        displayName = $docType.displayName
        alias = $docType.alias
        documentsCount = $count
        buttonColor = $docType.buttonColor
    }
}

$indexFile = Join-Path $OutputDir "index.json"
$index | ConvertTo-Json -Depth 10 | Out-File $indexFile -Encoding UTF8
Write-Host "  ✅ Индекс сохранён: $indexFile" -ForegroundColor Green

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ Извлечение завершено успешно!                              ║" -ForegroundColor Green
Write-Host "╠════════════════════════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║  📊 Типов документов: $($docTypesResponse.value.Count)" -ForegroundColor Green
Write-Host "║  📄 Всего документов: $totalDocs" -ForegroundColor Green
Write-Host "║  📁 Папка с данными: $OutputDir" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Используйте эти данные для демо-режима!" -ForegroundColor Cyan

