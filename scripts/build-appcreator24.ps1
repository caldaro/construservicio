$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$public = Join-Path $root 'public'
$outputDirectory = Join-Path $root 'appcreator24'
$output = Join-Path $outputDirectory 'index.html'

New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null

function Read-Text([string] $path) {
  if (-not (Test-Path -LiteralPath $path)) { throw "Archivo requerido no encontrado: $path" }
  return [System.IO.File]::ReadAllText($path)
}

function Inline-JavaScript([string] $path) {
  $code = Read-Text $path
  # El HTML5 monolítico comparte el código fuente, pero no puede ejecutar imports ES externos.
  $code = [regex]::Replace($code, '(?m)^\s*import\s+.*?;\s*$', '')
  $code = [regex]::Replace($code, '\bexport\s+(?=(async\s+)?(const|function|let|var|class)\b)', '')
  $code = [regex]::Replace($code, '\bexport\s*\{[^}]+\};?', '')
  $code = [regex]::Replace($code, 'if\s*\(\s*''serviceWorker''\s+in\s+navigator\s*\)\s*navigator\.serviceWorker\.register\([^;]+;\s*', '')
  return $code
}

$html = Read-Text (Join-Path $public 'index.html')
$html = [regex]::Replace($html, '(?is)\s*<link\s+[^>]*rel=["'']manifest["''][^>]*>', '')
$html = [regex]::Replace($html, '(?is)\s*<link\s+[^>]*rel=["'']icon["''][^>]*>', '')
$html = [regex]::Replace($html, '(?is)\s*<link\s+[^>]*rel=["'']stylesheet["''][^>]*>', '')
$html = [regex]::Replace($html, '(?is)\s*<script\s+src=["'']vendor/pdf-lib\.min\.js["'']\s*></script>', '')
$html = [regex]::Replace($html, '(?is)\s*<script\s+src=["'']vendor/jspdf\.umd\.min\.js["'']\s*></script>', '')
$html = [regex]::Replace($html, '(?is)\s*<script\s+type=["'']module["'']\s+src=["'']js/app\.js["'']\s*></script>', '')

$css = Read-Text (Join-Path $public 'css/styles.css')
$styleTag = "<style>`n$css`n</style>"
$html = [regex]::Replace($html, '(?i)</head>', [System.Text.RegularExpressions.MatchEvaluator] { param($match) "$styleTag`n</head>" }, 1)

$scripts = @(
  (Read-Text (Join-Path $public 'vendor/pdf-lib.min.js')),
  (Read-Text (Join-Path $public 'vendor/jspdf.umd.min.js')),
  (Inline-JavaScript (Join-Path $public 'js/calculator.js')),
  (Inline-JavaScript (Join-Path $public 'js/signature.js')),
  (Inline-JavaScript (Join-Path $public 'js/branding-data.js')),
  (Inline-JavaScript (Join-Path $public 'js/template-data.js')),
  (Inline-JavaScript (Join-Path $public 'js/pdf-engine.js')),
  (Inline-JavaScript (Join-Path $public 'js/whatsapp-bridge.js')),
  (Inline-JavaScript (Join-Path $public 'js/app.js'))
)
$scriptTags = ($scripts | ForEach-Object { "<script>`n$_`n</script>" }) -join "`n"
$html = [regex]::Replace($html, '(?i)</body>', [System.Text.RegularExpressions.MatchEvaluator] { param($match) "$scriptTags`n</body>" }, 1)

# AppCreator24 no debe intentar registrar el PWA service worker.
$html = [regex]::Replace($html, '(?is)<script[^>]*sw\.js[^>]*>.*?</script>', '')
[System.IO.File]::WriteAllText($output, $html, [System.Text.UTF8Encoding]::new($false))
Write-Output "Compilado: $output"
