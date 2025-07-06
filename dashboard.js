/**
 * 厂区货物调度系统 - 仪表盘JavaScript文件
 * 处理状态和图表展示
 */

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化仪表盘
    initDashboard();
});

/**
 * 初始化仪表盘
 */
function initDashboard() {
    // 加载系统状态
    updateSystemStatus();
    
    // 加载任务
    loadTasks();
}

/**
 * 渲染资源状态图表
 */
function renderResourceStatusChart(resources) {
    const chartContainer = document.getElementById('resource-status-chart');
    if (!chartContainer) return;
    
    // 清空容器
    chartContainer.innerHTML = '';
    
    // 准备数据
    const statusData = prepareResourceStatusData(resources);
    
    // 创建图表
    const width = chartContainer.offsetWidth;
    const height = chartContainer.offsetHeight;
    
    // 如果没有宽高，设置默认值
    const chartWidth = width || 300;
    const chartHeight = height || 200;
    
    // 创建SVG
    const svg = d3.select(chartContainer)
        .append('svg')
        .attr('width', chartWidth)
        .attr('height', chartHeight);
    
    // 创建图表标题
    svg.append('text')
        .attr('x', chartWidth / 2)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text('资源状态分布');
    
    // 计算每种资源类型的位置
    const categoryWidth = chartWidth / Object.keys(statusData).length;
    let categoryIndex = 0;
    
    // 为每种资源类型创建堆叠条形图
    for (const [category, statuses] of Object.entries(statusData)) {
        // 计算总数
        const total = Object.values(statuses).reduce((sum, count) => sum + count, 0);
        if (total === 0) continue;
        
        // 计算位置
        const xPos = categoryIndex * categoryWidth + categoryWidth / 2;
        const yPos = 50;
        
        // 创建饼图
        createPieChart(svg, xPos, yPos, 70, statuses, category);
        
        categoryIndex++;
    }
}

/**
 * 准备资源状态数据
 */
function prepareResourceStatusData(resources) {
    const statusData = {};
    
    // 处理每种资源
    for (const [resourceType, items] of Object.entries(resources)) {
        statusData[resourceType] = {};
        
        // 统计每种状态的数量
        for (const [_, status] of Object.entries(items)) {
            statusData[resourceType][status] = (statusData[resourceType][status] || 0) + 1;
        }
    }
    
    return statusData;
}

/**
 * 创建饼图
 */
function createPieChart(svg, x, y, radius, data, title) {
    // 定义颜色映射
    const colorMap = {
        '空闲': '#4CAF50',
        '忙碌': '#FFC107',
        '维护中': '#2196F3',
        '不可用': '#F44336'
    };
    
    // 准备饼图数据
    const pieData = Object.entries(data).map(([status, count]) => ({ 
        status, 
        count,
        color: colorMap[status] || '#9E9E9E' 
    }));
    
    // D3饼图生成器
    const pie = d3.pie()
        .value(d => d.count)
        .sort(null);
    
    // 弧生成器
    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);
    
    // 创建饼图组
    const pieGroup = svg.append('g')
        .attr('transform', `translate(${x}, ${y + 50})`);
    
    // 绘制饼图
    pieGroup.selectAll('path')
        .data(pie(pieData))
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', d => d.data.color)
        .attr('stroke', 'white')
        .style('stroke-width', '2px');
    
    // 添加类别标题
    svg.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text(formatResourceTypeName(title));
    
    // 创建图例
    const legendGroup = svg.append('g')
        .attr('transform', `translate(${x - radius}, ${y + radius + 60})`);
    
    pieData.forEach((d, i) => {
        const legendItem = legendGroup.append('g')
            .attr('transform', `translate(0, ${i * 20})`);
        
        legendItem.append('rect')
            .attr('width', 12)
            .attr('height', 12)
            .attr('fill', d.color);
        
        legendItem.append('text')
            .attr('x', 20)
            .attr('y', 10)
            .style('font-size', '12px')
            .text(`${d.status}: ${d.count}`);
    });
}

/**
 * 格式化资源类型名称
 */
function formatResourceTypeName(type) {
    const nameMap = {
        'terminal_cranes': '末端库行车',
        'product_cranes': '成品库行车',
        'frame_trucks': '框架车头',
        'frames': '框架'
    };
    
    return nameMap[type] || type;
}

/**
 * 渲染任务图表
 */
function renderTaskChart(tasks) {
    const chartContainer = document.getElementById('task-chart');
    if (!chartContainer) return;
    
    // 清空容器
    chartContainer.innerHTML = '';
    
    // 如果没有任务数据
    if (!tasks || Object.keys(tasks).length === 0) {
        chartContainer.innerHTML = '<div class="no-data">没有任务数据</div>';
        return;
    }
    
    // 准备数据
    const taskTypes = {};
    const taskStatuses = {};
    
    Object.values(tasks).forEach(task => {
        // 统计任务类型
        taskTypes[task.type] = (taskTypes[task.type] || 0) + 1;
        
        // 统计任务状态
        taskStatuses[task.status] = (taskStatuses[task.status] || 0) + 1;
    });
    
    // 创建Canvas元素
    const canvas = document.createElement('canvas');
    chartContainer.appendChild(canvas);
    
    // 创建Chart.js图表
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: ['按类型', '按状态'],
            datasets: [
                {
                    label: '船运发货',
                    data: [taskTypes['船运发货'] || 0, 0],
                    backgroundColor: '#3f51b5'
                },
                {
                    label: '内转任务',
                    data: [taskTypes['内转任务'] || 0, 0],
                    backgroundColor: '#f50057'
                },
                {
                    label: '空闲',
                    data: [0, taskStatuses['空闲'] || 0],
                    backgroundColor: '#4CAF50'
                },
                {
                    label: '忙碌',
                    data: [0, taskStatuses['忙碌'] || 0],
                    backgroundColor: '#FFC107'
                },
                {
                    label: '不可用',
                    data: [0, taskStatuses['不可用'] || 0],
                    backgroundColor: '#F44336'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: '任务分析'
                },
            },
            scales: {
                x: {
                    stacked: true,
                },
                y: {
                    stacked: true,
                    beginAtZero: true
                }
            }
        }
    });
} 