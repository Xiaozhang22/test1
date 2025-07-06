/**
 * 厂区货物调度系统 - 任务JavaScript文件
 * 处理任务相关功能
 */

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化船运计划表单
    initShipPlanForm();
    
    // 初始化内转任务表单
    initInternalTransferForm();
    
    // 初始化仓库库存表单
    initWarehouseStockForm();
    
    // 加载任务列表
    loadTasks();
});

/**
 * 初始化船运计划表单
 */
function initShipPlanForm() {
    // 添加产品按钮
    const addProductBtn = document.getElementById('add-plan-product');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', function() {
            const container = document.getElementById('ship-plan-products');
            if (container) {
                addProductSelectionRow(container);
            }
        });
    }
    
    // 表单提交
    const shipPlanForm = document.getElementById('ship-plan-form');
    if (shipPlanForm) {
        shipPlanForm.addEventListener('submit', function(e) {
            e.preventDefault();
            createShipPlan();
        });
    }
    
    // 设置默认截止时间（当前时间+2小时）
    const deadlineInput = document.getElementById('ship-plan-deadline');
    if (deadlineInput) {
        const now = new Date();
        now.setHours(now.getHours() + 2);
        deadlineInput.value = now.toISOString().slice(0, 16);
    }
}

/**
 * 初始化内转任务表单
 */
function initInternalTransferForm() {
    // 添加产品按钮
    const addProductBtn = document.getElementById('add-transfer-product');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', function() {
            const container = document.getElementById('transfer-products');
            if (container) {
                addProductSelectionRow(container);
            }
        });
    }
    
    // 表单提交
    const transferForm = document.getElementById('internal-transfer-form');
    if (transferForm) {
        transferForm.addEventListener('submit', function(e) {
            e.preventDefault();
            createInternalTransferTask();
        });
    }
}

/**
 * 初始化仓库库存表单
 */
function initWarehouseStockForm() {
    const stockForm = document.getElementById('warehouse-stock-form');
    if (stockForm) {
        stockForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateWarehouseStock();
        });
    }
}

/**
 * 创建船运计划
 */
function createShipPlan() {
    const id = document.getElementById('ship-plan-id').value;
    const deadline = document.getElementById('ship-plan-deadline').value;
    const priority = document.getElementById('ship-plan-priority').value;
    
    // 获取产品列表
    const products = {};
    const productRows = document.querySelectorAll('#ship-plan-products .product-selection-row');
    
    productRows.forEach(row => {
        const productId = row.querySelector('.product-select').value;
        const quantity = parseInt(row.querySelector('.product-quantity').value);
        
        if (productId && quantity > 0) {
            products[productId] = (products[productId] || 0) + quantity;
        }
    });
    
    if (Object.keys(products).length === 0) {
        alert('请至少添加一种产品');
        return;
    }
    
    const planData = {
        id: id || '',
        products: products,
        deadline: deadline,
        priority: priority
    };
    
    fetch(`${API_BASE_URL}/api/create_ship_plan`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(planData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('船运计划创建成功');
            document.getElementById('ship-plan-form').reset();
            
            // 清空产品选择区
            const container = document.getElementById('ship-plan-products');
            if (container) {
                container.innerHTML = '';
                addProductSelectionRow(container);
            }
            
            // 刷新计划列表
            loadShipPlans();
        } else {
            alert('船运计划创建失败');
        }
    })
    .catch(error => {
        console.error('船运计划创建失败:', error);
        alert('船运计划创建发生错误');
    });
}

/**
 * 创建船运任务
 */
function createShipTask(planId) {
    fetch(`${API_BASE_URL}/api/create_ship_transport_task`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan_id: planId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('船运任务创建成功');
            loadTasks();
        } else {
            alert('船运任务创建失败: ' + (data.message || '未知错误'));
        }
    })
    .catch(error => {
        console.error('船运任务创建失败:', error);
        alert('船运任务创建发生错误');
    });
}

/**
 * 创建内转任务
 */
function createInternalTransferTask() {
    const sourceWarehouseId = document.getElementById('source-warehouse').value;
    const targetWarehouseId = document.getElementById('target-warehouse').value;
    
    // 获取产品列表
    const products = {};
    const productRows = document.querySelectorAll('#transfer-products .product-selection-row');
    
    productRows.forEach(row => {
        const productId = row.querySelector('.product-select').value;
        const quantity = parseInt(row.querySelector('.product-quantity').value);
        
        if (productId && quantity > 0) {
            products[productId] = (products[productId] || 0) + quantity;
        }
    });
    
    if (!sourceWarehouseId || !targetWarehouseId) {
        alert('请选择来源仓库和目标仓库');
        return;
    }
    
    if (Object.keys(products).length === 0) {
        alert('请至少添加一种产品');
        return;
    }
    
    const taskData = {
        source_warehouse_id: sourceWarehouseId,
        target_warehouse_id: targetWarehouseId,
        products: products
    };
    
    fetch(`${API_BASE_URL}/api/create_internal_transfer_task`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('内转任务创建成功');
            document.getElementById('internal-transfer-form').reset();
            
            // 清空产品选择区
            const container = document.getElementById('transfer-products');
            if (container) {
                container.innerHTML = '';
                addProductSelectionRow(container);
            }
            
            // 刷新任务列表
            loadTasks();
        } else {
            alert('内转任务创建失败: ' + (data.message || '未知错误'));
        }
    })
    .catch(error => {
        console.error('内转任务创建失败:', error);
        alert('内转任务创建发生错误');
    });
}

/**
 * 更新仓库库存
 */
function updateWarehouseStock() {
    const warehouseId = document.getElementById('stock-warehouse').value;
    const productId = document.getElementById('stock-product').value;
    const quantity = document.getElementById('stock-quantity').value;
    
    if (!warehouseId || !productId || !quantity) {
        alert('请填写所有必填字段');
        return;
    }
    
    const stockData = {
        warehouse_id: warehouseId,
        product_id: productId,
        quantity: quantity
    };
    
    fetch(`${API_BASE_URL}/api/update_warehouse_product`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(stockData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('库存更新成功');
            document.getElementById('warehouse-stock-form').reset();
            loadSystemResources();
            
            // 如果当前显示的就是这个仓库的库存，刷新显示
            const inventorySelector = document.getElementById('warehouse-inventory-selector');
            if (inventorySelector && inventorySelector.value === warehouseId) {
                displayWarehouseInventory(warehouseId);
            }
        } else {
            alert('库存更新失败: ' + (data.message || '未知错误'));
        }
    })
    .catch(error => {
        console.error('库存更新失败:', error);
        alert('库存更新发生错误');
    });
}

/**
 * 加载船运计划列表
 */
function loadShipPlans() {
    const shipPlanTable = document.getElementById('ship-plan-table')?.querySelector('tbody');
    if (!shipPlanTable) return;
    
    shipPlanTable.innerHTML = '<tr><td colspan="5" class="loading">加载中...</td></tr>';
    
    // TODO: 实现船运计划列表API
    // 目前系统中没有单独的船运计划API，临时使用空数组
    const plans = [];
    
    if (plans.length === 0) {
        shipPlanTable.innerHTML = '<tr><td colspan="5" class="no-data">没有船运计划数据</td></tr>';
        return;
    }
    
    shipPlanTable.innerHTML = '';
    plans.forEach(plan => {
        const row = document.createElement('tr');
        
        const productsText = Object.entries(plan.products)
            .map(([id, qty]) => `${id}: ${qty}件`)
            .join(', ');
        
        const deadline = new Date(plan.deadline).toLocaleString();
        
        row.innerHTML = `
            <td>${plan.id}</td>
            <td>${productsText}</td>
            <td>${deadline}</td>
            <td>${plan.priority}</td>
            <td>
                <button class="btn primary create-task" data-plan-id="${plan.id}">创建任务</button>
            </td>
        `;
        
        // 添加创建任务按钮事件
        const createTaskBtn = row.querySelector('.create-task');
        if (createTaskBtn) {
            createTaskBtn.addEventListener('click', function() {
                const planId = this.getAttribute('data-plan-id');
                createShipTask(planId);
            });
        }
        
        shipPlanTable.appendChild(row);
    });
} 