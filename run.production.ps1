try {
    # Set environment variables
    $env:DATABASE_URL = ""
    $env:AUTH_ORIGIN = ""
    $env:AUTH_SECRET = ""
    $env:ICAL_USER = ""
    $env:ICAL_PASSWORD = ""
    $env:AP_IMG_UPLOAD_URL = ""
    $env:RENDER_SERVER_URL = ""

    # Start the server
    node .output/server/index.mjs
}
catch {
    Write-Error $_.Exception.ToString()
    Read-Host -Prompt "The above error occurred. Press Enter to exit."
}