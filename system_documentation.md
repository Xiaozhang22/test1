# 厂区货物调度系统文档

## 系统概述

本系统是一个完整的厂区货物调度算法，主要用于管理末端库到成品库的货物流转，支持船运发货和内转任务两种主要业务场景。

## 系统架构

### 核心组件

1. **仓库系统**
   - `TerminalWarehouse`: 末端库，存储待发货产品
   - `ProductWarehouse`: 成品库，存储最终产品，包含堆位管理

2. **设备资源**
   - `Crane`: 行车，用于装卸货物
   - `Frame`: 框架，货物载体
   - `FrameTruck`: 框架车头，拉动框架的运输工具

3. **任务系统**
   - `Task`: 主任务（船运/内转）
   - `SubTask`: 子任务（拉框、装货、运输、卸货、定位）

4. **调度核心**
   - `LogisticsSystem`: 主调度系统，管理所有资源和任务

## 主要功能

### 1. 船运发货任务流程

```
船运计划触发 → 资源状态查询 → 任务分解 → 资源分配 → 执行监控
```

**子任务序列：**
1. 框架车头拉框任务
2. 末端库行车装货任务
3. 框架车运输任务

### 2. 内转任务流程

```
内转需求触发 → 资源状态查询 → 任务分解 → 资源分配 → 执行监控
```

**子任务序列：**
1. 框架车头拉框任务
2. 末端库行车装货任务
3. 框架车运输任务
4. 成品库行车卸货任务
5. 框架车定位任务

## 系统特性

### 资源管理
- **状态跟踪**: 实时跟踪所有设备状态（空闲/忙碌/维护中/不可用）
- **智能分配**: 根据距离、负载等因素优化资源分配
- **冲突避免**: 防止资源重复分配

### 任务调度
- **优先级管理**: 船运任务优先级高于内转任务
- **并行执行**: 支持多任务并行执行
- **故障恢复**: 任务失败时自动恢复资源状态

### 扩展性设计
- **模块化架构**: 各组件独立，易于扩展
- **接口标准化**: 统一的资源和任务接口
- **配置驱动**: 支持参数化配置

## API 接口

### 核心查询接口

```python
# 获取资源状态
system.get_resource_status()

# 获取系统状态
system.get_system_status()

# 验证船运计划
system.validate_ship_plan(plan_id)

# 查找可用资源
system.find_available_resources()
```

### 任务创建接口

```python
# 创建船运任务
task = system.create_ship_transport_task(plan_id)

# 创建内转任务
task = system.create_internal_transfer_task(source_id, target_id, products)

# 执行任务
system.execute_task(task_id)
```

### 资源管理接口

```python
# 添加各类资源
system.add_terminal_warehouse(warehouse)
system.add_product_warehouse(warehouse)
system.add_crane(crane)
system.add_frame(frame)
system.add_frame_truck(truck)
```

## 测试案例

### 测试案例1：船运任务

**场景设置：**
- 末端库位置：(0, 0)，库存：钢材100件，水泥80件
- 成品库位置：(0, 9)
- 船运计划：钢材50件，水泥30件

**预期结果：**
- 成功创建船运任务
- 分配行车C001、车头T001、框架F001
- 依次执行拉框、装货、运输三个子任务
- 任务完成后所有资源恢复空闲状态

### 测试案例2：内转任务

**场景设置：**
- 末端库位置：(0, 0)，库存：钢材100件，水泥80件
- 成品库位置：(0, 9)
- 内转需求：钢材20件，水泥15件

**预期结果：**
- 成功创建内转任务
- 分配两个行车、一个车头、一个框架
- 依次执行拉框、装货、运输、卸货、定位五个子任务
- 产品从末端库转移到成品库
- 任务完成后所有资源恢复空闲状态

## 系统输出示例

### 船运任务执行输出

```
[INFO] 创建船运任务 ship_task_SP001，分配资源：行车C001, 车头T001, 框架F001
[INFO] 开始执行任务 ship_task_SP001
[INFO] 子任务 pull_ship_task_SP001 (框架车头拉框) 执行完成
[INFO] 子任务 load_ship_task_SP001 (末端库装货) 执行完成
[INFO] 子任务 transport_ship_task_SP001 (运输) 执行完成
[INFO] 任务 ship_task_SP001 执行完成

资源使用详情：
- 行车C001: 从末端库TW001装载50件钢材和30件水泥到框架F001
- 车头T001: 拉动框架F001从位置(5,5)到码头
- 框架F001: 承载货物，当前负载80件产品
- 目标位置: 船运码头
```

### 内转任务执行输出

```
[INFO] 创建内转任务 internal_task_TW001_PW001
[INFO] 开始执行任务 internal_task_TW001_PW001
[INFO] 子任务 pull_internal_task_TW001_PW001 (框架车头拉框) 执行完成
[INFO] 子任务 load_internal_task_TW001_PW001 (末端库装货) 执行完成
[INFO] 子任务 transport_internal_task_TW001_PW001 (运输) 执行完成
[INFO] 子任务 unload_internal_task_TW001_PW001 (成品库卸货) 执行完成
[INFO] 子任务 position_internal_task_TW001_PW001 (框架定位) 执行完成
[INFO] 任务 internal_task_TW001_PW001 执行完成

资源使用详情：
- 行车C001: 从末端库TW001装载20件钢材和15件水泥到框架F001
- 车头T001: 拉动框架F001从位置(5,5)到成品库PW001
- 框架F001: 承载货物，运输完成后空载
- 行车C002: 从框架F001卸载35件产品到成品库PW001
- 目标堆位: 成品库PW001的指定堆位
```

## 系统状态监控

### 实时状态查询

```json
{
  "warehouses": {
    "terminal": {
      "TW001": {
        "position": "(0, 0)",
        "products": {"P001": 100, "P002": 80}
      }
    },
    "product": {
      "PW001": {
        "position": "(0, 9)",
        "products": {"P001": 20, "P002": 15}
      }
    }
  },
  "resources": {
    "terminal_cranes": {"C001": "空闲"},
    "product_cranes": {"C002": "空闲"},
    "frame_trucks": {"T001": "空闲"},
    "frames": {"F001": "空闲"}
  },
  "active_tasks": {},
  "recent_logs": [...]
}
```

## 扩展指南

### 添加新资源类型

1. **定义新资源类**
```python
@dataclass
class NewResource:
    id: str
    name: str
    position: Position
    status: ResourceStatus = ResourceStatus.IDLE
    # 其他特有属性
```

2. **扩展系统管理**
```python
def add_new_resource(self, resource: NewResource):
    self.new_resources[resource.id] = resource
```

3. **更新资源查询**
```python
def find_available_resources(self):
    # 添加新资源类型的查询逻辑
    available["new_resources"] = [...]
```

### 添加新任务类型

1. **定义任务类型**
```python
class NewTaskType(Enum):
    NEW_TASK = "新任务类型"
```

2. **实现任务创建逻辑**
```python
def create_new_task(self, params) -> Optional[Task]:
    # 实现新任务的创建逻辑
    pass
```

3. **添加执行逻辑**
```python
def execute_new_sub_task(self, sub_task: SubTask):
    # 实现新子任务的执行逻辑
    pass
```

### 优化调度算法

1. **自定义优先级算法**
```python
def custom_task_priority(task):
    # 根据业务需求定义优先级
    if task.task_type == TaskType.URGENT:
        return 0  # 最高优先级
    return 1
```

2. **资源分配优化**
```python
def optimize_resource_allocation(self, task):
    # 实现基于距离、负载等因素的智能分配
    pass
```

3. **路径规划**
```python
def calculate_optimal_path(self, start: Position, end: Position):
    # 实现A*或其他路径规划算法
    pass
```

## 性能优化建议

### 1. 数据结构优化
- 使用索引加速资源查找
- 实现资源状态缓存
- 优化大规模任务的内存使用

### 2. 并发处理
- 支持多线程任务执行
- 实现任务队列管理
- 添加资源锁机制

### 3. 监控与日志
- 实现性能指标收集
- 添加详细的执行日志
- 支持实时监控面板

## 部署和配置

### 环境要求
- Python 3.8+
- 标准库依赖：datetime, uuid, enum, dataclasses, typing, json

### 配置参数
```python
# 系统配置
GRID_SIZE = (10, 10)  # 厂区网格大小
MAX_CONCURRENT_TASKS = 10  # 最大并发任务数
RESOURCE_TIMEOUT = 300  # 资源超时时间（秒）
LOG_LEVEL = "INFO"  # 日志级别
```

### 启动示例
```python
# 创建系统实例
system = LogisticsSystem(grid_size=(20, 20))

# 初始化资源
system.load_config_from_file("config.json")

# 启动调度服务
system.start_scheduler()
```

## 常见问题解答

### Q1: 如何处理资源冲突？
A1: 系统通过状态管理和资源锁机制避免冲突。每个资源在被分配时状态会变为"忙碌"，其他任务无法重复分配。

### Q2: 任务失败如何处理？
A2: 系统会自动恢复失败任务占用的资源状态，并记录失败原因。可以通过日志查看详细错误信息。

### Q3: 如何扩展到更大的厂区？
A3: 可以通过修改grid_size参数扩展厂区大小，同时增加相应的资源和优化路径规划算法。

### Q4: 支持实时监控吗？
A4: 系统提供了完整的状态查询接口，可以轻松集成到监控系统中实现实时监控。

## 版本历史

- **v1.0**: 基础功能实现，支持船运和内转任务
- **v1.1**: 添加优化调度算法
- **v1.2**: 增强错误处理和日志功能
- **v2.0**: 支持多厂区和复杂路径规划

## 联系信息

如需技术支持或功能扩展，请联系开发团队。

---

*本文档最后更新时间：2025年7月*