# Render the existing ThenFrame wordmark/arch as a single vector design.
# Requires Windows System.Drawing and Georgia; no image generation API is used.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$iconRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../public'))
$culture = [System.Globalization.CultureInfo]::InvariantCulture
$background = [System.Drawing.ColorTranslator]::FromHtml('#542033')
$cream = [System.Drawing.ColorTranslator]::FromHtml('#fff9f5')
$frameColor = [System.Drawing.Color]::FromArgb(140, 233, 212, 204)
$family = [System.Drawing.FontFamily]::new('Georgia')
$format = [System.Drawing.StringFormat]::GenericTypographic.Clone()
$word = [System.Drawing.Drawing2D.GraphicsPath]::new()
$word.AddString('ThenFrame', $family, 0, 80, [System.Drawing.PointF]::new(0, 0), $format)
$bounds = $word.GetBounds()
$scale = [Math]::Min(360 / $bounds.Width, 70 / $bounds.Height)
$matrix = [System.Drawing.Drawing2D.Matrix]::new()
$matrix.Scale($scale, $scale, [System.Drawing.Drawing2D.MatrixOrder]::Append)
$matrix.Translate(256 - ($bounds.X + $bounds.Width / 2) * $scale, 278 - ($bounds.Y + $bounds.Height / 2) * $scale, [System.Drawing.Drawing2D.MatrixOrder]::Append)
$word.Transform($matrix)
$safeBounds = $word.GetBounds()
$radius = [Math]::Sqrt([Math]::Pow($safeBounds.Width / 2, 2) + [Math]::Pow(22 + $safeBounds.Height / 2, 2))
if ($radius -gt 204.8) { throw 'Wordmark exceeds the maskable icon safe zone.' }

$arch = [System.Drawing.Drawing2D.GraphicsPath]::new()
$arch.AddLine(96, 398, 96, 234)
$arch.AddArc(96, 74, 320, 320, 180, 180)
$arch.AddLine(416, 234, 416, 398)
$arch.CloseFigure()

# Export outlined glyphs, so the SVG does not depend on a device having Georgia.
$commands = [System.Collections.Generic.List[string]]::new()
$points = $word.PathPoints
$types = $word.PathTypes
function Format-Point($point) {
  $point.X.ToString('0.###', $culture) + ' ' + $point.Y.ToString('0.###', $culture)
}
for ($n = 0; $n -lt $points.Length; $n++) {
  $kind = $types[$n] -band 7
  if ($kind -eq 0) { $commands.Add('M' + (Format-Point $points[$n])) }
  elseif ($kind -eq 1) { $commands.Add('L' + (Format-Point $points[$n])) }
  elseif ($kind -eq 3) {
    $commands.Add('C' + (Format-Point $points[$n]) + ' ' + (Format-Point $points[$n + 1]) + ' ' + (Format-Point $points[$n + 2]))
    $n += 2
  }
  else { throw 'Unsupported glyph path command.' }
  if ($types[$n] -band 128) { $commands.Add('Z') }
}
$svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="ThenFrame"><title>ThenFrame</title><rect width="512" height="512" fill="#542033"/><path d="M96 398V234a160 160 0 0 1 320 0v164Z" fill="none" stroke="#e9d4cc" stroke-opacity=".55" stroke-width="2"/><path fill="#fff9f5" fill-rule="evenodd" d="' + ($commands -join '') + '"/></svg>'
[System.IO.File]::WriteAllText((Join-Path $iconRoot 'brand.svg'), $svg + "`n")

$sizes = @{
  'thenframe-icon-192.png' = 192
  'thenframe-icon-512.png' = 512
  'thenframe-icon-1024.png' = 1024
  'thenframe-maskable-512.png' = 512
  'apple-touch-icon.png' = 180
}
foreach ($name in $sizes.Keys) {
  $size = $sizes[$name]
  $bitmap = [System.Drawing.Bitmap]::new($size, $size)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.Clear($background)
  $graphics.ScaleTransform($size / 512.0, $size / 512.0)
  $pen = [System.Drawing.Pen]::new($frameColor, 2)
  $brush = [System.Drawing.SolidBrush]::new($cream)
  $graphics.DrawPath($pen, $arch)
  $graphics.FillPath($brush, $word)
  $bitmap.Save((Join-Path $iconRoot $name), [System.Drawing.Imaging.ImageFormat]::Png)
  $brush.Dispose(); $pen.Dispose(); $graphics.Dispose(); $bitmap.Dispose()
}
$arch.Dispose(); $word.Dispose(); $matrix.Dispose(); $format.Dispose(); $family.Dispose()
Write-Output 'Generated ThenFrame SVG and 192/512/1024/maskable/Apple icons from one vector design.'
