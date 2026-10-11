$apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkamJkb3ZlaG1memVxbWhsaWN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTQxMzExMSwiZXhwIjoyMTA2OTg5MTExfQ.Va843D7x5lDPmOdZ7k4Z45tz_73VL6bWtrAMWecb0QY"
$baseurl = "https://gdjbdovehmfzeqmhlicz.supabase.co"
$headers = @{
    "apikey"        = $apikey
    "Authorization" = "Bearer $apikey"
    "Content-Type"  = "application/json"
    "Prefer"        = "return=representation"
}

# Try inserting a test row — if table doesn't exist it'll error, which is expected
# Instead, we'll use the Supabase management/postgres endpoint
Write-Host "Attempting to create settings table via pg function..."

# First check if there's a pg_net or exec function available
$testBody = '{"query":"SELECT version();"}'
try {
    $r = Invoke-WebRequest -Uri "$baseurl/rest/v1/rpc/exec" -Method POST -Headers $headers -Body $testBody -ErrorAction Stop
    Write-Host "exec function exists: $($r.Content)"
} catch {
    Write-Host "exec function not found: $($_.Exception.Message)"
}

# Try the Supabase SQL API (available in newer plans)
Write-Host ""
Write-Host "Trying Supabase SQL endpoint..."
$sqlBody = @{
    query = "CREATE TABLE IF NOT EXISTS public.settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TIMESTAMPTZ DEFAULT now());"
} | ConvertTo-Json

try {
    $r = Invoke-WebRequest -Uri "$baseurl/rest/v1/rpc/sql" -Method POST -Headers $headers -Body $sqlBody -ErrorAction Stop
    Write-Host "SQL endpoint: $($r.Content)"
} catch {
    Write-Host "SQL endpoint failed: $($_.Exception.Message)"
}

# Try inserting a dummy record to force-test settings access  
Write-Host ""
Write-Host "Current slideshow content:"
$sh = Invoke-WebRequest -Uri "$baseurl/rest/v1/slideshow?select=*&order=id.asc" -Headers $headers
Write-Host $sh.Content
