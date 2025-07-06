/**
 * 厂区货物调度系统 - 可视化JavaScript文件
 * 处理物流流程可视化
 */

// 全局变量
let layoutSvg = null;
let layoutWidth = 0;
let layoutHeight = 0;
let taskFlowSvg = null;
let simulationInProgress = false;
let simulationTimer = null;
let currentSimulationStep = 0;
let simulationTask = null;
let simulationResources = {};

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化厂区平面布局
    initLayoutVisualization();
    
    // 初始化任务流程图
    initTaskFlowChart();
    
    // 初始化任务模拟控制
    initTaskSimulation();
    
    // 窗口大小变化时重新调整
    window.addEventListener('resize', function() {
        // 重新初始化布局图
        initLayoutVisualization();
        
        // 重新初始化任务流程图
        if (simulationTask) {
            drawTaskFlow(simulationTask);
        }
    });
});

/**
 * 初始化厂区平面布局
 */
function initLayoutVisualization() {
    const container = document.getElementById('layout-visualization');
    if (!container) return;
    
    // 清空容器
    container.innerHTML = '';
    
    // 获取容器尺寸
    layoutWidth = container.clientWidth;
    layoutHeight = container.clientHeight;
    
    // 创建SVG
    layoutSvg = d3.select(container)
        .append('svg')
        .attr('width', layoutWidth)
        .attr('height', layoutHeight);
    
    // 获取系统资源用于布局绘制
    loadSystemResources();
}

/**
 * 初始化任务流程图
 */
function initTaskFlowChart() {
    const container = document.getElementById('task-flow-chart');
    if (!container) return;
    
    // 清空容器
    container.innerHTML = '';
    
    // 创建SVG
    taskFlowSvg = d3.select(container)
        .append('svg')
        .attr('width', container.clientWidth)
        .attr('height', container.clientHeight);
    
    // 默认流程图
    drawDefaultTaskFlow();
}

/**
 * 初始化任务模拟控制
 */
function initTaskSimulation() {
    // 开始模拟按钮
    const startBtn = document.getElementById('start-visualization');
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            const taskSelect = document.getElementById('visualization-task-select');
            if (!taskSelect || !taskSelect.value) {
                alert('请先选择要模拟的任务');
                return;
            }
            
            // 获取选中的任务ID
            const taskId = taskSelect.value;
            startTaskSimulation(taskId);
        });
    }
    
    // 重置模拟按钮
    const resetBtn = document.getElementById('reset-visualization');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            resetSimulation();
        });
    }
}

/**
 * 绘制平面布局
 */
function drawLayout() {
    if (!layoutSvg) return;
    
    // 清空现有内容
    layoutSvg.selectAll('*').remove();
    
    // 设置比例尺
    const gridSize = {x: 15, y: 15}; // 默认网格大小
    
    const xScale = d3.scaleLinear()
        .domain([0, gridSize.x - 1])
        .range([50, layoutWidth - 50]);
    
    const yScale = d3.scaleLinear()
        .domain([0, gridSize.y - 1])
        .range([50, layoutHeight - 50]);
    
    // 绘制网格背景
    drawGrid(layoutSvg, xScale, yScale, gridSize);
    
    // 绘制坐标轴
    drawAxes(layoutSvg, xScale, yScale, gridSize);
    
    // 绘制仓库
    drawWarehouses(layoutSvg, xScale, yScale);
    
    // 绘制设备
    drawEquipment(layoutSvg, xScale, yScale);
}

/**
 * 绘制网格背景
 */
function drawGrid(svg, xScale, yScale, gridSize) {
    // 绘制水平网格线
    for (let y = 0; y < gridSize.y; y++) {
        svg.append('line')
            .attr('x1', xScale(0))
            .attr('y1', yScale(y))
            .attr('x2', xScale(gridSize.x - 1))
            .attr('y2', yScale(y))
            .attr('stroke', '#ddd')
            .attr('stroke-width', 1);
    }
    
    // 绘制垂直网格线
    for (let x = 0; x < gridSize.x; x++) {
        svg.append('line')
            .attr('x1', xScale(x))
            .attr('y1', yScale(0))
            .attr('x2', xScale(x))
            .attr('y2', yScale(gridSize.y - 1))
            .attr('stroke', '#ddd')
            .attr('stroke-width', 1);
    }
}

/**
 * 绘制坐标轴
 */
function drawAxes(svg, xScale, yScale, gridSize) {
    // X轴
    svg.append('line')
        .attr('x1', xScale(0))
        .attr('y1', yScale(gridSize.y - 1) + 20)
        .attr('x2', xScale(gridSize.x - 1))
        .attr('y2', yScale(gridSize.y - 1) + 20)
        .attr('stroke', '#333')
        .attr('stroke-width', 2);
    
    // X轴刻度
    for (let x = 0; x < gridSize.x; x++) {
        svg.append('line')
            .attr('x1', xScale(x))
            .attr('y1', yScale(gridSize.y - 1) + 15)
            .attr('x2', xScale(x))
            .attr('y2', yScale(gridSize.y - 1) + 25)
            .attr('stroke', '#333')
            .attr('stroke-width', 2);
        
        svg.append('text')
            .attr('x', xScale(x))
            .attr('y', yScale(gridSize.y - 1) + 40)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .text(x);
    }
    
    // Y轴
    svg.append('line')
        .attr('x1', xScale(0) - 20)
        .attr('y1', yScale(0))
        .attr('x2', xScale(0) - 20)
        .attr('y2', yScale(gridSize.y - 1))
        .attr('stroke', '#333')
        .attr('stroke-width', 2);
    
    // Y轴刻度
    for (let y = 0; y < gridSize.y; y++) {
        svg.append('line')
            .attr('x1', xScale(0) - 25)
            .attr('y1', yScale(y))
            .attr('x2', xScale(0) - 15)
            .attr('y2', yScale(y))
            .attr('stroke', '#333')
            .attr('stroke-width', 2);
        
        svg.append('text')
            .attr('x', xScale(0) - 35)
            .attr('y', yScale(y) + 4)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .text(y);
    }
}

/**
 * 绘制仓库
 */
function drawWarehouses(svg, xScale, yScale) {
    // 末端库
    Object.values(systemResources.terminal_warehouses || {}).forEach(wh => {
        const x = xScale(wh.position.x);
        const y = yScale(wh.position.y);
        
        // 绘制矩形表示仓库
        svg.append('rect')
            .attr('x', x - 25)
            .attr('y', y - 25)
            .attr('width', 50)
            .attr('height', 50)
            .attr('fill', 'rgba(63, 81, 181, 0.7)')
            .attr('stroke', '#3f51b5')
            .attr('stroke-width', 2)
            .attr('rx', 5)
            .attr('ry', 5);
        
        // 添加仓库标签
        svg.append('text')
            .attr('x', x)
            .attr('y', y)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .style('fill', 'white')
            .style('font-weight', 'bold')
            .style('font-size', '12px')
            .text(wh.name);
        
        // 添加仓库类型标签
        svg.append('text')
            .attr('x', x)
            .attr('y', y + 15)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .style('fill', 'white')
            .style('font-size', '10px')
            .text('末端库');
    });
    
    // 成品库
    Object.values(systemResources.product_warehouses || {}).forEach(wh => {
        const x = xScale(wh.position.x);
        const y = yScale(wh.position.y);
        
        // 绘制矩形表示仓库
        svg.append('rect')
            .attr('x', x - 25)
            .attr('y', y - 25)
            .attr('width', 50)
            .attr('height', 50)
            .attr('fill', 'rgba(245, 0, 87, 0.7)')
            .attr('stroke', '#f50057')
            .attr('stroke-width', 2)
            .attr('rx', 5)
            .attr('ry', 5);
        
        // 添加仓库标签
        svg.append('text')
            .attr('x', x)
            .attr('y', y)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .style('fill', 'white')
            .style('font-weight', 'bold')
            .style('font-size', '12px')
            .text(wh.name);
        
        // 添加仓库类型标签
        svg.append('text')
            .attr('x', x)
            .attr('y', y + 15)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .style('fill', 'white')
            .style('font-size', '10px')
            .text('成品库');
    });
}

/**
 * 绘制设备
 */
function drawEquipment(svg, xScale, yScale) {
    // 行车
    Object.values(systemResources.cranes || {}).forEach(crane => {
        const x = xScale(crane.position.x);
        const y = yScale(crane.position.y);
        
        // 绘制圆形表示行车
        svg.append('circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', 10)
            .attr('fill', getStatusColor(crane.status))
            .attr('stroke', '#333')
            .attr('stroke-width', 1);
        
        // 添加行车标签
        svg.append('text')
            .attr('x', x)
            .attr('y', y - 15)
            .attr('text-anchor', 'middle')
            .style('font-size', '10px')
            .text(crane.name);
    });
    
    // 框架
    Object.values(systemResources.frames || {}).forEach(frame => {
        const x = xScale(frame.position.x);
        const y = yScale(frame.position.y);
        
        // 绘制矩形表示框架
        svg.append('rect')
            .attr('x', x - 8)
            .attr('y', y - 8)
            .attr('width', 16)
            .attr('height', 16)
            .attr('fill', getStatusColor(frame.status))
            .attr('stroke', '#333')
            .attr('stroke-width', 1);
        
        // 添加框架标签
        svg.append('text')
            .attr('x', x)
            .attr('y', y - 15)
            .attr('text-anchor', 'middle')
            .style('font-size', '10px')
            .text(frame.name);
    });
    
    // 车头
    Object.values(systemResources.frame_trucks || {}).forEach(truck => {
        const x = xScale(truck.position.x);
        const y = yScale(truck.position.y);
        
        // 绘制三角形表示车头
        const triangle = d3.symbol().type(d3.symbolTriangle).size(100);
        
        svg.append('path')
            .attr('d', triangle)
            .attr('transform', `translate(${x}, ${y})`)
            .attr('fill', getStatusColor(truck.status))
            .attr('stroke', '#333')
            .attr('stroke-width', 1);
        
        // 添加车头标签
        svg.append('text')
            .attr('x', x)
            .attr('y', y - 15)
            .attr('text-anchor', 'middle')
            .style('font-size', '10px')
            .text(truck.name);
    });
}

/**
 * 获取状态颜色
 */
function getStatusColor(status) {
    switch (status) {
        case '空闲': return '#4CAF50';
        case '忙碌': return '#FFC107';
        case '维护中': return '#2196F3';
        case '不可用': return '#F44336';
        default: return '#9E9E9E';
    }
}

/**
 * 绘制默认任务流程图
 */
function drawDefaultTaskFlow() {
    if (!taskFlowSvg) return;
    
    // 清空内容
    taskFlowSvg.selectAll('*').remove();
    
    const width = taskFlowSvg.attr('width');
    const height = taskFlowSvg.attr('height');
    
    // 在中心显示提示文本
    taskFlowSvg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .text('选择任务并开始模拟，查看任务流程');
}

/**
 * 绘制任务流程图
 */
function drawTaskFlow(task) {
    if (!taskFlowSvg || !task) return;
    
    // 清空内容
    taskFlowSvg.selectAll('*').remove();
    
    const width = taskFlowSvg.attr('width');
    const height = taskFlowSvg.attr('height');
    
    // 任务标题
    taskFlowSvg.append('text')
        .attr('x', width / 2)
        .attr('y', 30)
        .attr('text-anchor', 'middle')
        .style('font-size', '18px')
        .style('font-weight', 'bold')
        .text(`任务流程图: ${task.id} (${task.type})`);
    
    // 子任务数量
    const subTaskCount = task.sub_tasks.length;
    const boxWidth = 150;
    const boxHeight = 80;
    const gapWidth = (width - subTaskCount * boxWidth) / (subTaskCount + 1);
    
    // 绘制子任务框
    task.sub_tasks.forEach((subTask, index) => {
        const x = gapWidth + index * (boxWidth + gapWidth);
        const y = height / 2 - boxHeight / 2;
        
        // 绘制子任务框
        taskFlowSvg.append('rect')
            .attr('x', x)
            .attr('y', y)
            .attr('width', boxWidth)
            .attr('height', boxHeight)
            .attr('fill', getSubTaskColor(subTask))
            .attr('stroke', '#333')
            .attr('stroke-width', 1)
            .attr('rx', 5)
            .attr('ry', 5);
        
        // 子任务标题
        taskFlowSvg.append('text')
            .attr('x', x + boxWidth / 2)
            .attr('y', y + 25)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .style('font-weight', 'bold')
            .text(subTask.type);
        
        // 子任务ID
        taskFlowSvg.append('text')
            .attr('x', x + boxWidth / 2)
            .attr('y', y + 45)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .text(`ID: ${subTask.id.substring(0, 8)}...`);
        
        // 子任务状态
        taskFlowSvg.append('text')
            .attr('x', x + boxWidth / 2)
            .attr('y', y + 65)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .text(`状态: ${subTask.status}`);
        
        // 如果不是最后一个子任务，绘制连接箭头
        if (index < subTaskCount - 1) {
            const arrowX1 = x + boxWidth;
            const arrowX2 = x + boxWidth + gapWidth;
            const arrowY = height / 2;
            
            // 箭头线
            taskFlowSvg.append('line')
                .attr('x1', arrowX1)
                .attr('y1', arrowY)
                .attr('x2', arrowX2)
                .attr('y2', arrowY)
                .attr('stroke', '#333')
                .attr('stroke-width', 2)
                .attr('marker-end', 'url(#arrowhead)');
            
            // 添加箭头标记
            if (index === 0) {
                taskFlowSvg.append('defs')
                    .append('marker')
                    .attr('id', 'arrowhead')
                    .attr('viewBox', '0 -5 10 10')
                    .attr('refX', '5')
                    .attr('refY', '0')
                    .attr('orient', 'auto')
                    .attr('markerWidth', '6')
                    .attr('markerHeight', '6')
                    .append('path')
                    .attr('d', 'M0,-5L10,0L0,5')
                    .attr('fill', '#333');
            }
        }
    });
}

/**
 * 获取子任务颜色
 */
function getSubTaskColor(subTask) {
    switch (subTask.type) {
        case '框架车头拉框': return '#bbdefb';
        case '末端库装货': return '#c8e6c9';
        case '运输': return '#ffe0b2';
        case '成品库卸货': return '#f8bbd0';
        case '框架定位': return '#e1bee7';
        default: return '#f5f5f5';
    }
}

/**
 * 开始任务模拟
 */
function startTaskSimulation(taskId) {
    // 如果已有模拟在进行，先停止
    if (simulationInProgress) {
        resetSimulation();
    }
    
    fetch(`${API_BASE_URL}/api/tasks`)
        .then(response => response.json())
        .then(tasks => {
            if (!tasks || !tasks[taskId]) {
                alert('找不到指定任务');
                return;
            }
            
            simulationTask = tasks[taskId];
            
            // 绘制任务流程图
            drawTaskFlow(simulationTask);
            
            // 准备模拟
            prepareSimulation();
            
            // 开始模拟
            simulationInProgress = true;
            runSimulation();
        })
        .catch(error => {
            console.error('获取任务失败:', error);
            alert('获取任务数据失败');
        });
}

/**
 * 准备模拟
 */
function prepareSimulation() {
    // 存储初始资源状态
    simulationResources = JSON.parse(JSON.stringify(systemResources));
    
    // 重置模拟步骤
    currentSimulationStep = 0;
}

/**
 * 运行模拟
 */
function runSimulation() {
    // 如果模拟已经结束
    if (currentSimulationStep >= simulationTask.sub_tasks.length) {
        alert('模拟完成');
        resetSimulation();
        return;
    }
    
    const subTask = simulationTask.sub_tasks[currentSimulationStep];
    
    // 根据子任务类型执行不同的模拟
    switch (subTask.type) {
        case '框架车头拉框':
            simulateFramePulling(subTask);
            break;
        case '末端库装货':
            simulateTerminalLoading(subTask);
            break;
        case '运输':
            simulateTransport(subTask);
            break;
        case '成品库卸货':
            simulateProductUnloading(subTask);
            break;
        case '框架定位':
            simulateFramePositioning(subTask);
            break;
    }
    
    // 突出显示当前执行的子任务
    highlightCurrentSubTask();
    
    // 增加步骤计数
    currentSimulationStep++;
    
    // 如果还有子任务，继续模拟
    if (currentSimulationStep < simulationTask.sub_tasks.length) {
        simulationTimer = setTimeout(runSimulation, 2000); // 每个子任务间隔2秒
    } else {
        // 模拟结束
        setTimeout(() => {
            alert('任务模拟完成');
            resetSimulation();
        }, 1000);
    }
}

/**
 * 模拟框架车头拉框
 */
function simulateFramePulling(subTask) {
    // 示例实现 - 实际应根据具体子任务数据调整
    alert(`模拟执行: 框架车头拉框 (${subTask.id})`);
    
    // TODO: 实现具体的框架车头拉框动画
}

/**
 * 模拟末端库装货
 */
function simulateTerminalLoading(subTask) {
    // 示例实现 - 实际应根据具体子任务数据调整
    alert(`模拟执行: 末端库装货 (${subTask.id})`);
    
    // TODO: 实现具体的末端库装货动画
}

/**
 * 模拟运输
 */
function simulateTransport(subTask) {
    // 示例实现 - 实际应根据具体子任务数据调整
    alert(`模拟执行: 运输 (${subTask.id})`);
    
    // TODO: 实现具体的运输动画
}

/**
 * 模拟成品库卸货
 */
function simulateProductUnloading(subTask) {
    // 示例实现 - 实际应根据具体子任务数据调整
    alert(`模拟执行: 成品库卸货 (${subTask.id})`);
    
    // TODO: 实现具体的成品库卸货动画
}

/**
 * 模拟框架定位
 */
function simulateFramePositioning(subTask) {
    // 示例实现 - 实际应根据具体子任务数据调整
    alert(`模拟执行: 框架定位 (${subTask.id})`);
    
    // TODO: 实现具体的框架定位动画
}

/**
 * 突出显示当前执行的子任务
 */
function highlightCurrentSubTask() {
    if (!taskFlowSvg || !simulationTask) return;
    
    // 重置所有子任务的高亮
    taskFlowSvg.selectAll('rect').attr('stroke', '#333').attr('stroke-width', 1);
    
    // 获取当前子任务的位置
    const boxWidth = 150;
    const width = taskFlowSvg.attr('width');
    const subTaskCount = simulationTask.sub_tasks.length;
    const gapWidth = (width - subTaskCount * boxWidth) / (subTaskCount + 1);
    const x = gapWidth + currentSimulationStep * (boxWidth + gapWidth);
    
    // 高亮当前子任务
    taskFlowSvg.selectAll('rect')
        .filter((d, i) => i === currentSimulationStep)
        .attr('stroke', '#f50057')
        .attr('stroke-width', 3);
}

/**
 * 重置模拟
 */
function resetSimulation() {
    // 停止定时器
    if (simulationTimer) {
        clearTimeout(simulationTimer);
        simulationTimer = null;
    }
    
    // 重置状态
    simulationInProgress = false;
    currentSimulationStep = 0;
    
    // 还原系统资源状态
    if (simulationResources && Object.keys(simulationResources).length > 0) {
        systemResources = JSON.parse(JSON.stringify(simulationResources));
        drawLayout();
    }
    
    // 重置任务流程图
    if (simulationTask) {
        drawTaskFlow(simulationTask);
    } else {
        drawDefaultTaskFlow();
    }
} 