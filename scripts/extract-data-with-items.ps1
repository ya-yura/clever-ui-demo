# Скрипт извлечения данных С ТОВАРАМИ

param(
    [string]$ServerUrl = "http://localhost:9000/MobileSMARTS/api/v1",
    [string]$OutputDir = "src/data/demo"
)

$ProgressPreference = 'SilentlyContinue'

# Создать папку
New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Извлечение данных с сервера" -ForegroundColor Cyan
Write-Host "Сервер: $ServerUrl" -ForegroundColor Gray
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Получить DocTypes
Write-Host "[1/3] Получение типов документов..." -ForegroundColor Yellow
$docTypesUrl = "$ServerUrl/DocTypes"
try {
    $docTypes = Invoke-RestMethod -Uri $docTypesUrl -ErrorAction Stop
    $docTypesFile = Join-Path $OutputDir "doctypes.json"
    $docTypes | ConvertTo-Json -Depth 10 | Out-File $docTypesFile -Encoding UTF8
    Write-Host "✓ DocTypes сохранены: найдено $($docTypes.value.Count) типов" -ForegroundColor Green
} catch {
    Write-Host "✗ Ошибка получения DocTypes: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Получить документы с товарами
Write-Host "[2/3] Получение документов..." -ForegroundColor Yellow
$allDocs = @{}
$totalDocs = 0
$totalItems = 0

foreach ($docType in $docTypes.value) {
    $uni = $docType.uni
    $name = $docType.displayName
    
    Write-Host "  → $name ($uni)..." -ForegroundColor Gray -NoNewline
    
    # Получить документы с expand для товаров
    $docsUrl = "$ServerUrl/Docs/$uni`?`$expand=declaredItems,currentItems,combinedItems"
    
    try {
        $docs = Invoke-RestMethod -Uri $docsUrl -ErrorAction Stop
        
        if ($docs.value -and $docs.value.Count -gt 0) {
            $allDocs[$uni] = $docs.value
            $count = $docs.value.Count
            $totalDocs += $count
            
            # Подсчитать товары
            $itemsCount = 0
            foreach ($doc in $docs.value) {
                if ($doc.declaredItems) { $itemsCount += $doc.declaredItems.Count }
                if ($doc.currentItems) { $itemsCount += $doc.currentItems.Count }
                if ($doc.combinedItems) { $itemsCount += $doc.combinedItems.Count }
            }
            $totalItems += $itemsCount
            
            Write-Host " ✓ $count док., $itemsCount товаров" -ForegroundColor Green
        } else {
            $allDocs[$uni] = @()
            Write-Host " - нет данных" -ForegroundColor DarkGray
        }
    }
    catch {
        $allDocs[$uni] = @()
        Write-Host " ✗ ошибка: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Сохранить все документы
Write-Host "[3/3] Сохранение данных..." -ForegroundColor Yellow
$allDocsFile = Join-Path $OutputDir "documents.json"
$allDocs | ConvertTo-Json -Depth 20 | Out-File $allDocsFile -Encoding UTF8
Write-Host "✓ Документы сохранены в: $allDocsFile" -ForegroundColor Green

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Готово!" -ForegroundColor Green
Write-Host "Типов документов: $($docTypes.value.Count)" -ForegroundColor White
Write-Host "Всего документов: $totalDocs" -ForegroundColor White
Write-Host "Всего товаров: $totalItems" -ForegroundColor White
Write-Host "Папка: $OutputDir" -ForegroundColor Gray
Write-Host "==================================" -ForegroundColor Cyan
