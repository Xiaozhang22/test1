/**
 * 厂区货物调度系统 - 主JavaScript文件
 * 处理导航和通用功能
 */

// 全局变量
const API_BASE_URL = '';
let systemResources = {};

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化导航
    initNavigation();
    
    // 加载系统资源
    loadSystemResources();
    
    // 刷新状态按钮
    const refreshBtn = document.getElementById('refresh-status');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            loadSystemResources();
            updateSystemStatus();
            loadTasks();
        });
    }
    
    // 重置系统按钮
    const resetBtn = document.getElementById('reset-system');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            if (confirm('确定要重置系统吗？所有配置和任务都将被清除。')) {
                resetSystem();
            }
        });
    }
});

/**
 * 初始化导航功能
 */
function initNavigation() {
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const view = this.getAttribute('data-view');
            
            // 更新导航激活状态
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // 显示对应视图
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            document.getElementById(view).classList.add('active');
        });
    });
}

/**
 * 加载系统资源
 */
function loadSystemResources() {
    fetch(`${API_BASE_URL}/api/resources`)
        .then(response => response.json())
        .then(data => {
            systemResources = data;
            updateResourceCounts();
            updateWarehouseSelectors();
            updateProductSelectors();
            updateWarehouseInventorySelector();
            populateResourceTables();
        })
        .catch(error => {
            console.error('加载系统资源失败:', error);
        });
}

/**
 * 更新资源计数
 */
function updateResourceCounts() {
    document.getElementById('terminal-warehouse-count').textContent = 
        Object.keys(systemResources.terminal_warehouses || {}).length;
    
    document.getElementById('product-warehouse-count').textContent = 
        Object.keys(systemResources.product_warehouses || {}).length;
    
    document.getElementById('crane-count').textContent = 
        Object.keys(systemResources.cranes || {}).length;
    
    document.getElementById('frame-count').textContent = 
        Object.keys(systemResources.frames || {}).length;
    
    document.getElementById('truck-count').textContent = 
        Object.keys(systemResources.frame_trucks || {}).length;
}

/**
 * 更新系统状态
 */
function updateSystemStatus() {
    fetch(`${API_BASE_URL}/api/system_status`)
        .then(response => response.json())
        .then(data => {
            updateResourceStatusChart(data);
            updateSystemLogs(data.recent_logs);
        })
        .catch(error => {
            console.error('更新系统状态失败:', error);
        });
}

/**
 * 更新系统日志
 */
function updateSystemLogs(logs) {
    const logsList = document.getElementById('system-logs');
    if (!logsList) return;
    
    logsList.innerHTML = '';
    
    logs.forEach(log => {
        const li = document.createElement('li');
        const time = new Date(log.timestamp);
        const timeStr = time.toLocaleTimeString();
        
        let levelClass = '';
        switch (log.level) {
            case 'ERROR': levelClass = 'error'; break;
            case 'WARNING': levelClass = 'warning'; break;
            case 'INFO': levelClass = 'info'; break;
        }
        
        li.innerHTML = `<span class="log-time">[${timeStr}]</span> <span class="log-level ${levelClass}">[${log.level}]</span> ${log.message}`;
        logsList.appendChild(li);
    });
    
    // 滚动到底部
    logsList.scrollTop = logsList.scrollHeight;
}

/**
 * 更新资源状态图表
 */
function updateResourceStatusChart(data) {
    // 在dashboard.js中实现
    if (typeof renderResourceStatusChart === 'function') {
        renderResourceStatusChart(data.resources);
    }
}

/**
 * 更新仓库选择器
 */
function updateWarehouseSelectors() {
    // 源仓库选择器（末端库）
    const sourceSelect = document.getElementById('source-warehouse');
    if (sourceSelect) {
        sourceSelect.innerHTML = '';
        Object.values(systemResources.terminal_warehouses || {}).forEach(wh => {
            const option = document.createElement('option');
            option.value = wh.id;
            option.textContent = wh.name;
            sourceSelect.appendChild(option);
        });
    }
    
    // 目标仓库选择器（成品库）
    const targetSelect = document.getElementById('target-warehouse');
    if (targetSelect) {
        targetSelect.innerHTML = '';
        Object.values(systemResources.product_warehouses || {}).forEach(wh => {
            const option = document.createElement('option');
            option.value = wh.id;
            option.textContent = wh.name;
            targetSelect.appendChild(option);
        });
    }
    
    // 仓库库存选择器（两种仓库）
    const stockSelect = document.getElementById('stock-warehouse');
    if (stockSelect) {
        stockSelect.innerHTML = '';
        
        // 末端库
        Object.values(systemResources.terminal_warehouses || {}).forEach(wh => {
            const option = document.createElement('option');
            option.value = wh.id;
            option.textContent = `${wh.name} (末端库)`;
            stockSelect.appendChild(option);
        });
        
        // 成品库
        Object.values(systemResources.product_warehouses || {}).forEach(wh => {
            const option = document.createElement('option');
            option.value = wh.id;
            option.textContent = `${wh.name} (成品库)`;
            stockSelect.appendChild(option);
        });
    }
    
    // 行车所属仓库选择器
    const craneWarehouseSelect = document.getElementById('crane-warehouse');
    if (craneWarehouseSelect) {
        craneWarehouseSelect.innerHTML = '';
        
        // 末端库
        Object.values(systemResources.terminal_warehouses || {}).forEach(wh => {
            const option = document.createElement('option');
            option.value = wh.id;
            option.textContent = `${wh.name} (末端库)`;
            craneWarehouseSelect.appendChild(option);
        });
        
        // 成品库
        Object.values(systemResources.product_warehouses || {}).forEach(wh => {
            const option = document.createElement('option');
            option.value = wh.id;
            option.textContent = `${wh.name} (成品库)`;
            craneWarehouseSelect.appendChild(option);
        });
    }
}

/**
 * 更新产品选择器
 */
function updateProductSelectors() {
    // 产品选择器
    const stockProductSelect = document.getElementById('stock-product');
    if (stockProductSelect) {
        stockProductSelect.innerHTML = '';
        Object.values(systemResources.products || {}).forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.name} (ID: ${product.id})`;
            stockProductSelect.appendChild(option);
        });
    }
    
    // 船运计划和内转任务的产品选择UI
    updateProductSelectionUI('ship-plan-products');
    updateProductSelectionUI('transfer-products');
}

/**
 * 更新产品选择UI
 */
function updateProductSelectionUI(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // 清空现有产品选择器
    container.innerHTML = '';
    
    // 添加产品选择行
    if (Object.keys(systemResources.products || {}).length > 0) {
        addProductSelectionRow(container);
    } else {
        container.innerHTML = '<div class="no-products">没有可用产品，请先添加产品</div>';
    }
}

/**
 * 添加产品选择行
 */
function addProductSelectionRow(container) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'product-selection-row';
    
    // 产品选择器
    const productSelect = document.createElement('select');
    productSelect.className = 'product-select';
    Object.values(systemResources.products || {}).forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.name} (ID: ${product.id})`;
        productSelect.appendChild(option);
    });
    
    // 数量输入框
    const quantityInput = document.createElement('input');
    quantityInput.type = 'number';
    quantityInput.className = 'product-quantity';
    quantityInput.min = '1';
    quantityInput.value = '1';
    
    // 移除按钮
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn danger remove-product';
    removeBtn.textContent = '移除';
    removeBtn.addEventListener('click', function() {
        container.removeChild(rowDiv);
    });
    
    // 组装行
    rowDiv.appendChild(productSelect);
    rowDiv.appendChild(quantityInput);
    rowDiv.appendChild(removeBtn);
    
    container.appendChild(rowDiv);
}

/**
 * 更新仓库库存选择器
 */
function updateWarehouseInventorySelector() {
    const selector = document.getElementById('warehouse-inventory-selector');
    if (!selector) return;
    
    selector.innerHTML = '';
    
    // 末端库
    Object.values(systemResources.terminal_warehouses || {}).forEach(wh => {
        const option = document.createElement('option');
        option.value = wh.id;
        option.textContent = `${wh.name} (末端库)`;
        selector.appendChild(option);
    });
    
    // 成品库
    Object.values(systemResources.product_warehouses || {}).forEach(wh => {
        const option = document.createElement('option');
        option.value = wh.id;
        option.textContent = `${wh.name} (成品库)`;
        selector.appendChild(option);
    });
    
    // 首次加载显示第一个仓库的库存
    if (selector.options.length > 0) {
        displayWarehouseInventory(selector.options[0].value);
    }
    
    // 添加变更事件
    selector.addEventListener('change', function() {
        displayWarehouseInventory(this.value);
    });
}

/**
 * 显示仓库库存
 */
function displayWarehouseInventory(warehouseId) {
    const table = document.getElementById('warehouse-inventory-table').querySelector('tbody');
    if (!table) return;
    
    table.innerHTML = '';
    
    // 确定仓库类型和对象
    let warehouse = null;
    if (warehouseId in (systemResources.terminal_warehouses || {})) {
        warehouse = systemResources.terminal_warehouses[warehouseId];
    } else if (warehouseId in (systemResources.product_warehouses || {})) {
        warehouse = systemResources.product_warehouses[warehouseId];
    }
    
    if (!warehouse) return;
    
    // 显示产品
    Object.entries(warehouse.products || {}).forEach(([productId, quantity]) => {
        const product = systemResources.products[productId];
        if (!product) return;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${productId}</td>
            <td>${product.name}</td>
            <td>${quantity}</td>
        `;
        table.appendChild(row);
    });
    
    // 如果没有产品
    if (table.children.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="3" class="no-data">仓库中没有产品</td>';
        table.appendChild(row);
    }
}

/**
 * 填充资源表格
 */
function populateResourceTables() {
    // 产品表格
    const productTable = document.getElementById('product-table')?.querySelector('tbody');
    if (productTable) {
        productTable.innerHTML = '';
        Object.values(systemResources.products || {}).forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.weight}</td>
                <td>${product.volume}</td>
            `;
            productTable.appendChild(row);
        });
    }
    
    // 仓库表格
    const warehouseTable = document.getElementById('warehouse-table')?.querySelector('tbody');
    if (warehouseTable) {
        warehouseTable.innerHTML = '';
        
        // 末端库
        Object.values(systemResources.terminal_warehouses || {}).forEach(wh => {
            const row = document.createElement('tr');
            const productCount = Object.values(wh.products || {}).reduce((sum, qty) => sum + qty, 0);
            row.innerHTML = `
                <td>${wh.id}</td>
                <td>${wh.name}</td>
                <td>末端库</td>
                <td>(${wh.position.x}, ${wh.position.y})</td>
                <td>${wh.capacity}</td>
                <td>${productCount}</td>
            `;
            warehouseTable.appendChild(row);
        });
        
        // 成品库
        Object.values(systemResources.product_warehouses || {}).forEach(wh => {
            const row = document.createElement('tr');
            const productCount = Object.values(wh.products || {}).reduce((sum, qty) => sum + qty, 0);
            row.innerHTML = `
                <td>${wh.id}</td>
                <td>${wh.name}</td>
                <td>成品库</td>
                <td>(${wh.position.x}, ${wh.position.y})</td>
                <td>${wh.capacity}</td>
                <td>${productCount}</td>
            `;
            warehouseTable.appendChild(row);
        });
    }
    
    // 设备表格
    const equipmentTable = document.getElementById('equipment-table')?.querySelector('tbody');
    if (equipmentTable) {
        equipmentTable.innerHTML = '';
        
        // 行车
        Object.values(systemResources.cranes || {}).forEach(crane => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${crane.id}</td>
                <td>${crane.name}</td>
                <td>行车</td>
                <td>(${crane.position.x}, ${crane.position.y})</td>
                <td>${crane.status}</td>
                <td>所属仓库: ${crane.warehouse_id}</td>
            `;
            equipmentTable.appendChild(row);
        });
        
        // 框架
        Object.values(systemResources.frames || {}).forEach(frame => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${frame.id}</td>
                <td>${frame.name}</td>
                <td>框架</td>
                <td>(${frame.position.x}, ${frame.position.y})</td>
                <td>${frame.status}</td>
                <td></td>
            `;
            equipmentTable.appendChild(row);
        });
        
        // 车头
        Object.values(systemResources.frame_trucks || {}).forEach(truck => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${truck.id}</td>
                <td>${truck.name}</td>
                <td>车头</td>
                <td>(${truck.position.x}, ${truck.position.y})</td>
                <td>${truck.status}</td>
                <td>拉取框架: ${truck.attached_frame_id || '无'}</td>
            `;
            equipmentTable.appendChild(row);
        });
    }
}

/**
 * 加载任务列表
 */
function loadTasks() {
    fetch(`${API_BASE_URL}/api/tasks`)
        .then(response => response.json())
        .then(data => {
            updateTaskStats(data);
            populateTaskTable(data);
            updateVisualizationTaskSelect(data);
        })
        .catch(error => {
            console.error('加载任务列表失败:', error);
        });
}

/**
 * 更新任务统计
 */
function updateTaskStats(tasks) {
    const activeTasks = Object.values(tasks).filter(task => task.status !== '空闲').length;
    const completedTasks = Object.values(tasks).filter(task => task.end_time).length;
    
    document.getElementById('active-tasks').textContent = activeTasks;
    document.getElementById('completed-tasks').textContent = completedTasks;
}

/**
 * 填充任务表格
 */
function populateTaskTable(tasks) {
    const tasksTable = document.getElementById('tasks-table')?.querySelector('tbody');
    if (!tasksTable) return;
    
    tasksTable.innerHTML = '';
    
    Object.values(tasks).forEach(task => {
        const row = document.createElement('tr');
        
        const startTime = task.start_time ? new Date(task.start_time).toLocaleString() : '-';
        const endTime = task.end_time ? new Date(task.end_time).toLocaleString() : '-';
        
        row.innerHTML = `
            <td>${task.id}</td>
            <td>${task.type}</td>
            <td>${task.status}</td>
            <td>${task.sub_tasks.length}</td>
            <td>${startTime}</td>
            <td>${endTime}</td>
            <td>
                ${!task.end_time ? `<button class="btn primary execute-task" data-task-id="${task.id}">执行</button>` : ''}
                <button class="btn secondary view-task" data-task-id="${task.id}">查看详情</button>
            </td>
        `;
        
        // 添加执行任务事件
        const executeBtn = row.querySelector('.execute-task');
        if (executeBtn) {
            executeBtn.addEventListener('click', function() {
                const taskId = this.getAttribute('data-task-id');
                executeTask(taskId);
            });
        }
        
        // 添加查看任务详情事件
        const viewBtn = row.querySelector('.view-task');
        if (viewBtn) {
            viewBtn.addEventListener('click', function() {
                const taskId = this.getAttribute('data-task-id');
                showTaskDetails(taskId);
            });
        }
        
        tasksTable.appendChild(row);
    });
    
    // 如果没有任务
    if (tasksTable.children.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="7" class="no-data">没有任务数据</td>';
        tasksTable.appendChild(row);
    }
}

/**
 * 更新可视化任务选择器
 */
function updateVisualizationTaskSelect(tasks) {
    const taskSelect = document.getElementById('visualization-task-select');
    if (!taskSelect) return;
    
    taskSelect.innerHTML = '';
    
    Object.values(tasks).forEach(task => {
        const option = document.createElement('option');
        option.value = task.id;
        option.textContent = `${task.id} (${task.type})`;
        taskSelect.appendChild(option);
    });
    
    // 如果没有任务
    if (taskSelect.children.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = '没有可用任务';
        option.disabled = true;
        option.selected = true;
        taskSelect.appendChild(option);
    }
}

/**
 * 执行任务
 */
function executeTask(taskId) {
    fetch(`${API_BASE_URL}/api/execute_task`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task_id: taskId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('任务执行成功');
            updateSystemLogs(data.logs);
            loadTasks();
            loadSystemResources();
        } else {
            alert('任务执行失败');
        }
    })
    .catch(error => {
        console.error('任务执行失败:', error);
        alert('任务执行发生错误');
    });
}

/**
 * 显示任务详情
 */
function showTaskDetails(taskId) {
    alert('功能开发中: 显示任务详情 ' + taskId);
    
    // 切换到可视化视图并选择对应任务
    const vizTab = document.querySelector('nav a[data-view="visualization"]');
    if (vizTab) {
        vizTab.click();
    }
    
    const taskSelect = document.getElementById('visualization-task-select');
    if (taskSelect) {
        taskSelect.value = taskId;
    }
}

/**
 * 重置系统
 */
function resetSystem() {
    fetch(`${API_BASE_URL}/api/reset_system`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('系统已重置');
            loadSystemResources();
            updateSystemStatus();
            loadTasks();
        } else {
            alert('系统重置失败');
        }
    })
    .catch(error => {
        console.error('系统重置失败:', error);
        alert('系统重置发生错误');
    });
} 