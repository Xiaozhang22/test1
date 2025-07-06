/**
 * 厂区货物调度系统 - 配置JavaScript文件
 * 处理产品、仓库和设备管理
 */

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化标签页
    initTabs();
    
    // 初始化表单提交处理
    initFormHandlers();
});

/**
 * 初始化标签页
 */
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // 获取父级标签页容器
            const tabsContainer = this.closest('.tabs').parentElement;
            
            // 移除所有活动状态
            tabsContainer.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            tabsContainer.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // 设置当前标签页为活动状态
            this.classList.add('active');
            
            // 激活对应内容
            const contentId = this.getAttribute('data-tab');
            tabsContainer.querySelector(`#${contentId}`).classList.add('active');
        });
    });
}

/**
 * 初始化表单处理
 */
function initFormHandlers() {
    // 产品表单
    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addProduct();
        });
    }
    
    // 末端库表单
    const terminalWarehouseForm = document.getElementById('terminal-warehouse-form');
    if (terminalWarehouseForm) {
        terminalWarehouseForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addTerminalWarehouse();
        });
    }
    
    // 成品库表单
    const productWarehouseForm = document.getElementById('product-warehouse-form');
    if (productWarehouseForm) {
        productWarehouseForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addProductWarehouse();
        });
    }
    
    // 行车表单
    const craneForm = document.getElementById('crane-form');
    if (craneForm) {
        craneForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addCrane();
        });
    }
    
    // 框架表单
    const frameForm = document.getElementById('frame-form');
    if (frameForm) {
        frameForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addFrame();
        });
    }
    
    // 车头表单
    const truckForm = document.getElementById('truck-form');
    if (truckForm) {
        truckForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addFrameTruck();
        });
    }
}

/**
 * 添加产品
 */
function addProduct() {
    const id = document.getElementById('product-id').value;
    const name = document.getElementById('product-name').value;
    const weight = document.getElementById('product-weight').value;
    const volume = document.getElementById('product-volume').value;
    
    if (!name || !weight || !volume) {
        alert('请填写所有必填字段');
        return;
    }
    
    const productData = {
        id: id || '',
        name: name,
        weight: weight,
        volume: volume
    };
    
    fetch(`${API_BASE_URL}/api/add_product`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('产品添加成功');
            document.getElementById('product-form').reset();
            loadSystemResources();
        } else {
            alert('产品添加失败');
        }
    })
    .catch(error => {
        console.error('产品添加失败:', error);
        alert('产品添加发生错误');
    });
}

/**
 * 添加末端库
 */
function addTerminalWarehouse() {
    const id = document.getElementById('tw-id').value;
    const name = document.getElementById('tw-name').value;
    const position_x = document.getElementById('tw-position-x').value;
    const position_y = document.getElementById('tw-position-y').value;
    const capacity = document.getElementById('tw-capacity').value;
    
    if (!name || !position_x || !position_y || !capacity) {
        alert('请填写所有必填字段');
        return;
    }
    
    const warehouseData = {
        id: id || '',
        name: name,
        position_x: position_x,
        position_y: position_y,
        capacity: capacity
    };
    
    fetch(`${API_BASE_URL}/api/add_terminal_warehouse`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(warehouseData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('末端库添加成功');
            document.getElementById('terminal-warehouse-form').reset();
            loadSystemResources();
        } else {
            alert('末端库添加失败');
        }
    })
    .catch(error => {
        console.error('末端库添加失败:', error);
        alert('末端库添加发生错误');
    });
}

/**
 * 添加成品库
 */
function addProductWarehouse() {
    const id = document.getElementById('pw-id').value;
    const name = document.getElementById('pw-name').value;
    const position_x = document.getElementById('pw-position-x').value;
    const position_y = document.getElementById('pw-position-y').value;
    const capacity = document.getElementById('pw-capacity').value;
    
    if (!name || !position_x || !position_y || !capacity) {
        alert('请填写所有必填字段');
        return;
    }
    
    const warehouseData = {
        id: id || '',
        name: name,
        position_x: position_x,
        position_y: position_y,
        capacity: capacity
    };
    
    fetch(`${API_BASE_URL}/api/add_product_warehouse`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(warehouseData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('成品库添加成功');
            document.getElementById('product-warehouse-form').reset();
            loadSystemResources();
        } else {
            alert('成品库添加失败');
        }
    })
    .catch(error => {
        console.error('成品库添加失败:', error);
        alert('成品库添加发生错误');
    });
}

/**
 * 添加行车
 */
function addCrane() {
    const id = document.getElementById('crane-id').value;
    const name = document.getElementById('crane-name').value;
    const position_x = document.getElementById('crane-position-x').value;
    const position_y = document.getElementById('crane-position-y').value;
    const warehouse_id = document.getElementById('crane-warehouse').value;
    
    if (!name || !position_x || !position_y || !warehouse_id) {
        alert('请填写所有必填字段');
        return;
    }
    
    const craneData = {
        id: id || '',
        name: name,
        position_x: position_x,
        position_y: position_y,
        warehouse_id: warehouse_id
    };
    
    fetch(`${API_BASE_URL}/api/add_crane`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(craneData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('行车添加成功');
            document.getElementById('crane-form').reset();
            loadSystemResources();
        } else {
            alert('行车添加失败');
        }
    })
    .catch(error => {
        console.error('行车添加失败:', error);
        alert('行车添加发生错误');
    });
}

/**
 * 添加框架
 */
function addFrame() {
    const id = document.getElementById('frame-id').value;
    const name = document.getElementById('frame-name').value;
    const position_x = document.getElementById('frame-position-x').value;
    const position_y = document.getElementById('frame-position-y').value;
    
    if (!name || !position_x || !position_y) {
        alert('请填写所有必填字段');
        return;
    }
    
    const frameData = {
        id: id || '',
        name: name,
        position_x: position_x,
        position_y: position_y
    };
    
    fetch(`${API_BASE_URL}/api/add_frame`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(frameData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('框架添加成功');
            document.getElementById('frame-form').reset();
            loadSystemResources();
        } else {
            alert('框架添加失败');
        }
    })
    .catch(error => {
        console.error('框架添加失败:', error);
        alert('框架添加发生错误');
    });
}

/**
 * 添加车头
 */
function addFrameTruck() {
    const id = document.getElementById('truck-id').value;
    const name = document.getElementById('truck-name').value;
    const position_x = document.getElementById('truck-position-x').value;
    const position_y = document.getElementById('truck-position-y').value;
    
    if (!name || !position_x || !position_y) {
        alert('请填写所有必填字段');
        return;
    }
    
    const truckData = {
        id: id || '',
        name: name,
        position_x: position_x,
        position_y: position_y
    };
    
    fetch(`${API_BASE_URL}/api/add_frame_truck`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(truckData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('车头添加成功');
            document.getElementById('truck-form').reset();
            loadSystemResources();
        } else {
            alert('车头添加失败');
        }
    })
    .catch(error => {
        console.error('车头添加失败:', error);
        alert('车头添加发生错误');
    });
} 