const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

const NEW_API_TARGET = 'https://new-api-production-ef85.up.railway.app';
const API_KEY = 'sk-jZnUEbQLbXsfgRXM8AGjjrsMs6v2pODHslzLUF99r1qrWtak';

// 完整的 HTML 内容（包含前端所有逻辑）
const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CheapToken 管理控制台</title>
    <script src="https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
        *{margin:0;padding:0;box-sizing:border-box;}
        body{font-family:'Inter',system-ui;background:#f0f2f6;display:flex;height:100vh;overflow:hidden;transition:background 0.3s;}
        .sidebar{width:260px;background:#1e293b;color:#e2e8f0;display:flex;flex-direction:column;overflow-y:auto;}
        .logo{padding:24px 20px;font-size:1.5rem;font-weight:bold;border-bottom:1px solid #334155;}
        .logo span{background:linear-gradient(135deg,#3b82f6,#a855f7);-webkit-background-clip:text;background-clip:text;color:transparent;}
        .nav-item{padding:12px 20px;margin:4px 12px;border-radius:12px;display:flex;align-items:center;gap:12px;cursor:pointer;transition:all 0.2s;color:#cbd5e1;}
        .nav-item i{width:24px;text-align:center;}
        .nav-item.active{background:#3b82f6;color:white;}
        .nav-item:hover:not(.active){background:#334155;}
        .nav-divider{height:1px;background:#334155;margin:12px 20px;}
        .bottom-section{margin-top:auto;padding-bottom:20px;}
        .main{flex:1;overflow-y:auto;padding:24px 32px;}
        .top-bar{display:flex;justify-content:space-between;align-items:center;margin-bottom:28px;}
        .page-title{font-size:1.8rem;font-weight:600;background:linear-gradient(135deg,#1e293b,#3b82f6);-webkit-background-clip:text;background-clip:text;color:transparent;}
        .badge{background:#e2e8f0;padding:6px 12px;border-radius:40px;font-size:0.8rem;color:#1e293b;display:flex;align-items:center;gap:10px;}
        .badge button{background:#3b82f6;border:none;color:white;padding:4px 12px;border-radius:20px;cursor:pointer;font-size:0.75rem;display:inline-flex;align-items:center;gap:6px;}
        .badge button:hover{background:#2563eb;}
        .stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;margin-bottom:32px;}
        .stat-card{background:white;border-radius:24px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.05);border:1px solid #eef2ff;}
        .stat-title{font-size:0.85rem;text-transform:uppercase;letter-spacing:1px;color:#64748b;margin-bottom:12px;}
        .stat-value{font-size:2.2rem;font-weight:700;color:#0f172a;}
        .stat-sub{font-size:0.8rem;color:#3b82f6;margin-top:8px;}
        .chart-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:32px;}
        .chart-card{background:white;border-radius:24px;padding:20px;border:1px solid #eef2ff;}
        .chart-header{display:flex;justify-content:space-between;margin-bottom:20px;font-weight:600;color:#1e293b;}
        .full-width{grid-column:span 2;}
        .recent-table{background:white;border-radius:24px;padding:20px;border:1px solid #eef2ff;overflow-x:auto;}
        table{width:100%;border-collapse:collapse;}
        th,td{text-align:left;padding:12px 8px;border-bottom:1px solid #eef2ff;}
        th{color:#64748b;font-weight:500;}
        .model-tag{background:#eef2ff;padding:4px 12px;border-radius:20px;font-size:0.8rem;font-family:monospace;}
        .loading,.error{text-align:center;padding:40px;color:#64748b;}
        .error{color:#ef4444;}
        .view{display:none;}
        .view.active-view{display:block;}
        body.dark-mode{background:#0f172a;}
        body.dark-mode .stat-card,body.dark-mode .chart-card,body.dark-mode .recent-table{background:#1e293b;border-color:#334155;color:#e2e8f0;}
        body.dark-mode .stat-value{color:#f1f5f9;}
        body.dark-mode .badge{background:#334155;color:#cbd5e1;}
        body.dark-mode .model-tag{background:#334155;color:#e2e8f0;}
        body.dark-mode th{color:#94a3b8;}
        @media (max-width:800px){.sidebar{width:80px;}.sidebar .nav-text,.logo span:first-child{display:none;}.chart-grid{grid-template-columns:1fr;}.full-width{grid-column:span 1;}}
    </style>
</head>
<body>
<div class="sidebar">
    <div class="logo"><i class="fas fa-coins"></i> <span>CheapToken</span><div style="font-size:0.7rem;">v0.1.121</div></div>
    <div class="nav-item active" data-view="dashboard"><i class="fas fa-tachometer-alt"></i> <span class="nav-text">仪表盘</span></div>
    <div class="nav-item" data-view="apikeys"><i class="fas fa-key"></i> <span class="nav-text">API密钥</span></div>
    <div class="nav-item" data-view="usage"><i class="fas fa-receipt"></i> <span class="nav-text">使用记录</span></div>
    <div class="nav-item" data-view="settings"><i class="fas fa-cog"></i> <span class="nav-text">系统设置</span></div>
    <div class="nav-divider"></div>
    <div class="bottom-section">
        <div class="nav-item" data-view="account"><i class="fas fa-user-circle"></i> <span class="nav-text">我的账户</span></div>
        <div class="nav-item" id="darkModeToggle"><i class="fas fa-moon"></i> <span class="nav-text">深色模式</span></div>
    </div>
</div>
<div class="main">
    <div class="top-bar"><div class="page-title" id="pageTitle">仪表盘</div><div class="badge"><i class="far fa-clock"></i> <span id="refreshTime"></span><button id="manualRefreshBtn"><i class="fas fa-sync-alt"></i> 刷新</button></div></div>
    <div id="dashboardView" class="view active-view">
        <div class="stats-grid" id="statsGrid"><div class="stat-card"><div class="stat-title"><i class="fas fa-key"></i> API密钥</div><div class="stat-value">--</div><div class="stat-sub">加载中...</div></div><div class="stat-card"><div class="stat-title"><i class="fas fa-chart-simple"></i> 今日Token</div><div class="stat-value">--</div><div class="stat-sub">≈ --</div></div><div class="stat-card"><div class="stat-title"><i class="fas fa-dollar-sign"></i> 预估费用</div><div class="stat-value">--</div><div class="stat-sub">今日 / 本月 --</div></div><div class="stat-card"><div class="stat-title"><i class="fas fa-rocket"></i> 请求次数</div><div class="stat-value">--</div><div class="stat-sub">成功率 --</div></div></div>
        <div class="chart-grid"><div class="chart-card"><div class="chart-header"><span><i class="fas fa-chart-pie"></i> 模型分布 (Token占比)</span><span>近24h</span></div><div id="pieChart" style="height:260px;"></div></div><div class="chart-card"><div class="chart-header"><span><i class="fas fa-chart-line"></i> 实时用量趋势</span><span>Token/小时</span></div><div id="lineChart" style="height:260px;"></div></div><div class="chart-card full-width"><div class="chart-header"><span><i class="fas fa-fire"></i> 最近使用 (Top 12 模型)</span><span>过去24小时</span></div><div id="barChart" style="height:280px;"></div></div></div>
        <div class="recent-table"><div style="display:flex; justify-content:space-between; margin-bottom:16px;"><strong><i class="fas fa-history"></i> 详细使用记录</strong><span style="color:#3b82f6;">最后5条</span></div><table><thead><tr><th>模型</th><th>Token用量</th><th>费用($)</th><th>时间</th></tr></thead><tbody id="logTableBody"><tr><td colspan="4" class="loading">加载中...</td></tr></tbody></table></div>
    </div>
    <div id="apikeysView" class="view"><div class="recent-table"><h3><i class="fas fa-key"></i> API 密钥列表</h3><table id="apikeysTable"><thead><tr><th>名称</th><th>密钥</th><th>额度</th><th>状态</th></tr></thead><tbody><tr><td colspan="4" class="loading">加载中...</td></tr></tbody></table></div></div>
    <div id="usageView" class="view"><div class="recent-table"><h3><i class="fas fa-history"></i> 全部使用记录（最近50条）</h3><div style="overflow-x:auto;"><table id="allUsageTable"><thead><tr><th>模型</th><th>Token用量</th><th>费用($)</th><th>时间</th></tr></thead><tbody><tr><td colspan="4" class="loading">加载中...</td></tr></tbody></table></div></div></div>
    <div id="settingsView" class="view"><div class="recent-table"><h3><i class="fas fa-cog"></i> 系统设置</h3><p>此处可以扩展设置项（例如API代理地址、刷新间隔等）</p><label>深色模式：</label><button id="darkModeBtnSettings">切换深色模式</button></div></div>
    <div id="accountView" class="view"><div class="recent-table"><h3><i class="fas fa-user-circle"></i> 我的账户</h3><p>用户名: admin</p><p>角色: 管理员</p><p>账户余额: 从 New API 获取中...</p></div></div>
</div>
<script>
    const API_BASE = '';
    const API_KEY = '${API_KEY}';
    
    async function apiRequest(endpoint, params = {}) {
        const url = new URL(endpoint, window.location.origin);
        Object.keys(params).forEach(k => url.searchParams.append(k, params[k]));
        const response = await fetch(url, {
            headers: { 'Authorization': \`Bearer \${API_KEY}\`, 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
        return response.json();
    }
    
    async function fetchAllLogs(limitDays = 1, maxPages = 20) {
        const allLogs = [];
        let page = 0;
        const size = 100;
        const now = new Date();
        const cutoffTime = new Date(now.getTime() - limitDays * 24 * 60 * 60 * 1000);
        let hasMore = true;
        while (hasMore && page < maxPages) {
            try {
                const data = await apiRequest('/api/log', { p: page, size: size });
                const logs = data.data || [];
                if (logs.length === 0) break;
                for (const log of logs) {
                    const logTime = new Date(log.created_at);
                    if (logTime >= cutoffTime) allLogs.push(log);
                    else { hasMore = false; break; }
                }
                if (logs.length < size) break;
                page++;
            } catch (err) { throw err; }
        }
        return allLogs;
    }
    
    async function fetchTokens() {
        try {
            const data = await apiRequest('/api/token');
            return data.data || [];
        } catch (err) { return []; }
    }
    
    function computeStats(logs) {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        let todayTokens = 0, todayCost = 0, todayRequests = 0;
        const modelTokenMap = new Map();
        const hourlyTokens = new Array(24).fill(0);
        for (const log of logs) {
            const logTime = new Date(log.created_at);
            const tokens = log.total_tokens || 0;
            const cost = parseFloat(log.amount) || 0;
            const model = log.model || 'unknown';
            if (logTime >= startOfDay) {
                todayTokens += tokens;
                todayCost += cost;
                todayRequests++;
            }
            modelTokenMap.set(model, (modelTokenMap.get(model) || 0) + tokens);
            const hour = logTime.getHours();
            hourlyTokens[hour] += tokens;
        }
        const modelDistribution = Array.from(modelTokenMap.entries()).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
        const topModels = modelDistribution.slice(0,12);
        const recentLogs = logs.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0,5).map(log => ({
            model: log.model,
            tokens: log.total_tokens || 0,
            cost: parseFloat(log.amount) || 0,
            time: new Date(log.created_at).toLocaleString()
        }));
        return { todayTokens, todayCost, todayRequests, modelDistribution, hourlyTokens, topModels, recentLogs, allLogs: logs };
    }
    
    let pieChart, lineChart, barChart;
    function renderCharts(modelDistribution, hourlyTokens, topModels) {
        if (!pieChart) pieChart = echarts.init(document.getElementById('pieChart'));
        pieChart.setOption({ tooltip: { trigger: 'item' }, legend: { orient: 'vertical', left: 'left' }, series: [{ type: 'pie', radius: '55%', data: modelDistribution, label: { show: true, formatter: '{b}: {d}%' } }] });
        if (!lineChart) lineChart = echarts.init(document.getElementById('lineChart'));
        lineChart.setOption({ tooltip: { trigger: 'axis' }, xAxis: { type: 'category', data: Array.from({length:24}, (_,i) => i+':00') }, yAxis: { type: 'value', name: 'Token 用量' }, series: [{ type: 'line', smooth: true, data: hourlyTokens, areaStyle: { opacity: 0.2 }, color: '#3b82f6' }] });
        if (!barChart) barChart = echarts.init(document.getElementById('barChart'));
        barChart.setOption({ tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } }, xAxis: { type: 'category', data: topModels.map(m => m.name), axisLabel: { rotate: 35, interval: 0, fontSize: 10 } }, yAxis: { type: 'value', name: 'Token 用量' }, series: [{ type: 'bar', data: topModels.map(m => m.value), itemStyle: { borderRadius: [6,6,0,0], color: '#3b82f6' } }], grid: { bottom: 60 } });
    }
    
    function updateUI(stats, tokensCount) {
        document.querySelector('#statsGrid .stat-card:nth-child(1) .stat-value').innerHTML = \`\${tokensCount} / \${tokensCount}\`;
        document.querySelector('#statsGrid .stat-card:nth-child(1) .stat-sub').innerHTML = tokensCount > 0 ? '✅ 全部启用' : '⚠️ 无密钥';
        document.querySelector('#statsGrid .stat-card:nth-child(2) .stat-value').innerHTML = (stats.todayTokens / 1000).toFixed(2) + 'K';
        document.querySelector('#statsGrid .stat-card:nth-child(2) .stat-sub').innerHTML = \`≈ $\${stats.todayCost.toFixed(3)}\`;
        document.querySelector('#statsGrid .stat-card:nth-child(3) .stat-value').innerHTML = \`$\${stats.todayCost.toFixed(3)}\`;
        document.querySelector('#statsGrid .stat-card:nth-child(3) .stat-sub').innerHTML = '今日 / 本月 待累计';
        document.querySelector('#statsGrid .stat-card:nth-child(4) .stat-value').innerHTML = stats.todayRequests.toLocaleString();
        document.querySelector('#statsGrid .stat-card:nth-child(4) .stat-sub').innerHTML = '成功率 暂无数据';
        const tbody = document.getElementById('logTableBody');
        if (stats.recentLogs.length === 0) tbody.innerHTML = '<tr><td colspan=\"4\" class=\"loading\">暂无使用记录</td></tr>';
        else tbody.innerHTML = stats.recentLogs.map(log => \`<tr><td><span class=\"model-tag\">\${escapeHtml(log.model)}</span></td><td>\${log.tokens.toLocaleString()}</td><td>$\${log.cost.toFixed(4)}</td><td>\${log.time}</td></tr>\`).join('');
    }
    
    function escapeHtml(str) { return str.replace(/[&<>]/g, function(m) { if (m === '&') return '&amp;'; if (m === '<') return '&lt;'; if (m === '>') return '&gt;'; return m; }); }
    
    async function loadApiKeysView() {
        const tbody = document.querySelector('#apikeysView tbody');
        tbody.innerHTML = '<tr><td colspan=\"4\" class=\"loading\">加载中...</td></tr>';
        try {
            const tokens = await fetchTokens();
            if (tokens.length === 0) tbody.innerHTML = '<tr><td colspan=\"4\" class=\"loading\">暂无 API 密钥</td></tr>';
            else tbody.innerHTML = tokens.map(tok => \`<tr><td>\${escapeHtml(tok.name || '未命名')}</td><td>\${escapeHtml(tok.key || tok.token || '****')}</td><td>\${tok.remaining_quota || '无限制'}</td><td>\${tok.status === 1 ? '✅ 启用' : '❌ 禁用'}</td></tr>\`).join('');
        } catch (err) { tbody.innerHTML = \`<tr><td colspan=\"4\" class=\"error\">加载失败: \${err.message}</td></tr>\`; }
    }
    
    async function loadAllUsageView() {
        const tbody = document.querySelector('#usageView tbody');
        tbody.innerHTML = '<tr><td colspan=\"4\" class=\"loading\">加载中...</td></tr>';
        try {
            const logs = await fetchAllLogs(7, 20);
            const sorted = logs.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0,50);
            if (sorted.length === 0) tbody.innerHTML = '<tr><td colspan=\"4\" class=\"loading\">暂无记录</td></tr>';
            else tbody.innerHTML = sorted.map(log => \`<tr><td><span class=\"model-tag\">\${escapeHtml(log.model)}</span></td><td>\${(log.total_tokens || 0).toLocaleString()}</td><td>$\${(parseFloat(log.amount) || 0).toFixed(4)}</td><td>\${new Date(log.created_at).toLocaleString()}</td></tr>\`).join('');
        } catch (err) { tbody.innerHTML = \`<tr><td colspan=\"4\" class=\"error\">加载失败: \${err.message}</td></tr>\`; }
    }
    
    async function loadAccountView() {
        const container = document.querySelector('#accountView .recent-table');
        try {
            const userData = await apiRequest('/api/user/self');
            container.innerHTML = \`<h3><i class=\"fas fa-user-circle\"></i> 我的账户</h3><p>用户名: \${escapeHtml(userData.username || 'admin')}</p><p>角色: \${userData.role === 1 ? '管理员' : '普通用户'}</p><p>剩余额度: \${userData.remaining_quota || '未知'}</p><p>已用额度: \${userData.used_quota || '未知'}</p>\`;
        } catch (err) { container.innerHTML = \`<h3><i class=\"fas fa-user-circle\"></i> 我的账户</h3><p class=\"error\">加载失败: \${err.message}</p>\`; }
    }
    
    async function loadDashboard() {
        const refreshSpan = document.getElementById('refreshTime');
        refreshSpan.innerText = '请求中...';
        try {
            const [logs, tokens] = await Promise.all([fetchAllLogs(1), fetchTokens()]);
            const stats = computeStats(logs);
            renderCharts(stats.modelDistribution, stats.hourlyTokens, stats.topModels);
            updateUI(stats, tokens.length);
            refreshSpan.innerText = new Date().toLocaleTimeString();
        } catch (err) {
            console.error(err);
            document.getElementById('logTableBody').innerHTML = \`<tr><td colspan=\"4\" class=\"error\">数据加载失败: \${err.message}</td></tr>\`;
            refreshSpan.innerText = '加载失败';
        }
    }
    
    let currentView = 'dashboard';
    function switchView(viewId) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active-view'));
        document.getElementById(\`\${viewId}View\`).classList.add('active-view');
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        document.querySelector(\`.nav-item[data-view=\"\${viewId}\"]\`).classList.add('active');
        const titles = { dashboard:'仪表盘', apikeys:'API密钥', usage:'使用记录', settings:'系统设置', account:'我的账户' };
        document.getElementById('pageTitle').innerText = titles[viewId] || viewId;
        currentView = viewId;
        if (viewId === 'apikeys') loadApiKeysView();
        else if (viewId === 'usage') loadAllUsageView();
        else if (viewId === 'account') loadAccountView();
        else if (viewId === 'dashboard') loadDashboard();
    }
    
    function initDarkMode() {
        const isDark = localStorage.getItem('darkMode') === 'true';
        if (isDark) document.body.classList.add('dark-mode');
        const toggleDark = () => {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
        };
        document.getElementById('darkModeToggle').addEventListener('click', toggleDark);
        const settingsBtn = document.getElementById('darkModeBtnSettings');
        if (settingsBtn) settingsBtn.addEventListener('click', toggleDark);
    }
    
    function bindEvents() {
        document.querySelectorAll('.nav-item[data-view]').forEach(item => {
            item.addEventListener('click', (e) => {
                const view = item.getAttribute('data-view');
                if (view) switchView(view);
            });
        });
        document.getElementById('manualRefreshBtn').addEventListener('click', () => {
            if (currentView === 'dashboard') loadDashboard();
            else if (currentView === 'apikeys') loadApiKeysView();
            else if (currentView === 'usage') loadAllUsageView();
            else if (currentView === 'account') loadAccountView();
        });
    }
    
    function init() {
        bindEvents();
        initDarkMode();
        switchView('dashboard');
    }
    init();
</script>
</body>
</html>`;

app.get('/', (req, res) => {
    res.send(htmlContent);
});

app.use('/api', createProxyMiddleware({
    target: NEW_API_TARGET,
    changeOrigin: true,
    headers: {
        'Authorization': `Bearer ${API_KEY}`
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log(`[Proxy] ${req.method} ${req.url}`);
    }
}));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
