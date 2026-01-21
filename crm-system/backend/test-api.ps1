# 测试CRM API
Write-Host "=== CRM API 测试 ===" -ForegroundColor Cyan

# 1. 登录获取token
Write-Host "`n1. 登录测试..." -ForegroundColor Yellow
$loginBody = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.data.token
    Write-Host "✅ 登录成功" -ForegroundColor Green
} catch {
    Write-Host "❌ 登录失败: $_" -ForegroundColor Red
    exit 1
}

$headers = @{
    'Authorization' = "Bearer $token"
    'Content-Type' = 'application/json'
}

# 2. 测试获取机会列表
Write-Host "`n2. 测试获取机会列表..." -ForegroundColor Yellow
try {
    $oppUrl = 'http://localhost:3000/api/opportunities?onlyMine=true'
    $opportunities = Invoke-RestMethod -Uri $oppUrl -Headers $headers
    Write-Host "✅ 获取机会列表成功，共 $($opportunities.data.total) 条" -ForegroundColor Green
} catch {
    Write-Host "❌ 获取机会列表失败: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "详细错误: $($_.ErrorDetails.Message)" -ForegroundColor Red
}

# 3. 测试获取统计数据
Write-Host "`n3. 测试获取统计数据..." -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "http://localhost:3000/api/opportunities/stats" -Headers $headers
    Write-Host "✅ 获取统计数据成功" -ForegroundColor Green
    Write-Host "   总机会数: $($stats.data.total)" -ForegroundColor Cyan
    Write-Host "   进行中: $($stats.data.open)" -ForegroundColor Cyan
    Write-Host "   已赢单: $($stats.data.won)" -ForegroundColor Cyan
    Write-Host "   预期金额: $($stats.data.totalAmount)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ 获取统计数据失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. 测试获取客户列表
Write-Host "`n4. 测试获取客户列表..." -ForegroundColor Yellow
try {
    $customersUrl = 'http://localhost:3000/api/customers?onlyMine=false&pageSize=10'
    $customers = Invoke-RestMethod -Uri $customersUrl -Headers $headers
    Write-Host "✅ 获取客户列表成功，共 $($customers.data.total) 条" -ForegroundColor Green
} catch {
    Write-Host "❌ 获取客户列表失败: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== 测试完成 ===" -ForegroundColor Cyan
