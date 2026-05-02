param(
    [Parameter(Mandatory = $true)]
    [string]$Title,

    [string]$Slug,

    [string]$Date = (Get-Date -Format "yyyy-MM-dd")
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function New-Slug {
    param([string]$Value)

    $slug = $Value.ToLowerInvariant()
    $slug = [regex]::Replace($slug, "[^a-z0-9]+", "-")
    $slug = $slug.Trim("-")

    if ([string]::IsNullOrWhiteSpace($slug)) {
        throw "Unable to build a slug from the title."
    }

    return $slug
}

function Escape-JsString {
    param([string]$Value)

    return $Value.Replace("\", "\\").Replace('"', '\"')
}

$resolvedSlug = if ([string]::IsNullOrWhiteSpace($Slug)) { New-Slug -Value $Title } else { $Slug }
$dataPath = Join-Path $PSScriptRoot "js\articles-data.js"
$source = Get-Content -Path $dataPath -Raw

if ($source -match "slug:\s*`"$([regex]::Escape($resolvedSlug))`"") {
    throw "Slug '$resolvedSlug' already exists in js/articles-data.js."
}

$escapedTitle = Escape-JsString -Value $Title
$escapedSlug = Escape-JsString -Value $resolvedSlug

$articleBlock = @"
    ,
    {
        slug: "$escapedSlug",
        title: "$escapedTitle",
        date: "$Date",
        excerpt: "Write a short summary here.",
        content: [
            "First paragraph.",
            "Second paragraph."
        ]
    }
];
"@

$updated = [regex]::Replace($source, "\]\s*;\s*$", $articleBlock, 1)

if ($updated -eq $source) {
    throw "Unable to find the article array ending in js/articles-data.js."
}

Set-Content -Path $dataPath -Value $updated -Encoding utf8
Write-Output "Added article stub: $resolvedSlug"
Write-Output "Open article.html?slug=$resolvedSlug after writing your content."
