"""
厂区货物调度算法系统
Factory Logistics Scheduling System

主要功能：
1. 船运发货计划调度
2. 内转任务调度
3. 资源状态管理
4. 任务执行跟踪

作者：AI Assistant
版本：1.0
"""

from enum import Enum
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, field
import uuid
from datetime import datetime, timedelta
import json


class ResourceStatus(Enum):
    """资源状态枚举"""
    IDLE = "空闲"
    BUSY = "忙碌"
    MAINTENANCE = "维护中"
    UNAVAILABLE = "不可用"


class TaskType(Enum):
    """任务类型枚举"""
    SHIP_TRANSPORT = "船运发货"
    INTERNAL_TRANSFER = "内转任务"


class SubTaskType(Enum):
    """子任务类型枚举"""
    FRAME_PULLING = "框架车头拉框"
    TERMINAL_LOADING = "末端库装货"
    TRANSPORT = "运输"
    PRODUCT_UNLOADING = "成品库卸货"
    FRAME_POSITIONING = "框架定位"


@dataclass
class Position:
    """位置坐标"""
    x: int
    y: int
    
    def __str__(self):
        return f"({self.x}, {self.y})"
    
    def distance_to(self, other: 'Position') -> float:
        """计算到另一个位置的距离"""
        return ((self.x - other.x) ** 2 + (self.y - other.y) ** 2) ** 0.5


@dataclass
class Product:
    """产品信息"""
    id: str
    name: str
    weight: float
    volume: float
    
    def __post_init__(self):
        if not self.id:
            self.id = str(uuid.uuid4())[:8]


@dataclass
class Warehouse:
    """仓库基类"""
    id: str
    name: str
    position: Position
    capacity: float
    current_load: float = 0.0
    products: Dict[str, int] = field(default_factory=dict)  # 产品ID -> 数量
    
    def __post_init__(self):
        if not self.id:
            self.id = str(uuid.uuid4())[:8]
    
    def add_product(self, product_id: str, quantity: int) -> bool:
        """添加产品"""
        if self.current_load < self.capacity:
            self.products[product_id] = self.products.get(product_id, 0) + quantity
            return True
        return False
    
    def remove_product(self, product_id: str, quantity: int) -> bool:
        """移除产品"""
        if product_id in self.products and self.products[product_id] >= quantity:
            self.products[product_id] -= quantity
            if self.products[product_id] == 0:
                del self.products[product_id]
            return True
        return False


@dataclass
class TerminalWarehouse(Warehouse):
    """末端库"""
    crane_id: str = ""  # 关联的行车ID


@dataclass
class ProductWarehouse(Warehouse):
    """成品库"""
    crane_id: str = ""  # 关联的行车ID
    storage_positions: Dict[str, Position] = field(default_factory=dict)  # 堆位信息


@dataclass
class Crane:
    """行车"""
    id: str
    name: str
    position: Position
    status: ResourceStatus = ResourceStatus.IDLE
    load_capacity: float = 100.0
    current_load: float = 0.0
    warehouse_id: str = ""  # 所属仓库ID
    
    def __post_init__(self):
        if not self.id:
            self.id = str(uuid.uuid4())[:8]


@dataclass
class Frame:
    """框架"""
    id: str
    name: str
    position: Position
    status: ResourceStatus = ResourceStatus.IDLE
    capacity: float = 50.0
    current_load: float = 0.0
    loaded_products: Dict[str, int] = field(default_factory=dict)
    
    def __post_init__(self):
        if not self.id:
            self.id = str(uuid.uuid4())[:8]


@dataclass
class FrameTruck:
    """框架车头"""
    id: str
    name: str
    position: Position
    status: ResourceStatus = ResourceStatus.IDLE
    attached_frame_id: str = ""  # 当前拉的框架ID
    speed: float = 10.0  # 移动速度
    
    def __post_init__(self):
        if not self.id:
            self.id = str(uuid.uuid4())[:8]


@dataclass
class ShipPlan:
    """船运计划"""
    id: str
    products: Dict[str, int]  # 产品ID -> 数量
    deadline: datetime
    priority: int = 1
    
    def __post_init__(self):
        if not self.id:
            self.id = str(uuid.uuid4())[:8]


@dataclass
class SubTask:
    """子任务"""
    id: str
    task_type: SubTaskType
    status: ResourceStatus = ResourceStatus.IDLE
    assigned_resources: Dict[str, str] = field(default_factory=dict)  # 资源类型 -> 资源ID
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    details: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        if not self.id:
            self.id = str(uuid.uuid4())[:8]


@dataclass
class Task:
    """主任务"""
    id: str
    task_type: TaskType
    status: ResourceStatus = ResourceStatus.IDLE
    sub_tasks: List[SubTask] = field(default_factory=list)
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    details: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        if not self.id:
            self.id = str(uuid.uuid4())[:8]


class LogisticsSystem:
    """物流调度系统"""
    
    def __init__(self, grid_size: Tuple[int, int] = (10, 10)):
        self.grid_size = grid_size
        self.terminal_warehouses: Dict[str, TerminalWarehouse] = {}
        self.product_warehouses: Dict[str, ProductWarehouse] = {}
        self.cranes: Dict[str, Crane] = {}
        self.frames: Dict[str, Frame] = {}
        self.frame_trucks: Dict[str, FrameTruck] = {}
        self.products: Dict[str, Product] = {}
        self.ship_plans: Dict[str, ShipPlan] = {}
        self.tasks: Dict[str, Task] = {}
        self.execution_log: List[Dict[str, Any]] = []
    
    def add_terminal_warehouse(self, warehouse: TerminalWarehouse):
        """添加末端库"""
        self.terminal_warehouses[warehouse.id] = warehouse
    
    def add_product_warehouse(self, warehouse: ProductWarehouse):
        """添加成品库"""
        self.product_warehouses[warehouse.id] = warehouse
    
    def add_crane(self, crane: Crane):
        """添加行车"""
        self.cranes[crane.id] = crane
    
    def add_frame(self, frame: Frame):
        """添加框架"""
        self.frames[frame.id] = frame
    
    def add_frame_truck(self, truck: FrameTruck):
        """添加框架车头"""
        self.frame_trucks[truck.id] = truck
    
    def add_product(self, product: Product):
        """添加产品"""
        self.products[product.id] = product
    
    def add_ship_plan(self, plan: ShipPlan):
        """添加船运计划"""
        self.ship_plans[plan.id] = plan
    
    def get_resource_status(self) -> Dict[str, Dict[str, ResourceStatus]]:
        """获取所有资源状态"""
        return {
            "terminal_cranes": {crane.id: crane.status for crane in self.cranes.values() 
                               if any(crane.warehouse_id == tw.id for tw in self.terminal_warehouses.values())},
            "product_cranes": {crane.id: crane.status for crane in self.cranes.values() 
                              if any(crane.warehouse_id == pw.id for pw in self.product_warehouses.values())},
            "frame_trucks": {truck.id: truck.status for truck in self.frame_trucks.values()},
            "frames": {frame.id: frame.status for frame in self.frames.values()},
            "storage_positions": {pos_id: "occupied" if pos_id in pw.storage_positions else "available" 
                                 for pw in self.product_warehouses.values() for pos_id in pw.storage_positions}
        }
    
    def validate_ship_plan(self, plan_id: str) -> bool:
        """验证船运计划是否有效"""
        if plan_id not in self.ship_plans:
            return False
        
        plan = self.ship_plans[plan_id]
        
        # 检查末端库是否有足够的产品
        for product_id, required_qty in plan.products.items():
            total_available = 0
            for warehouse in self.terminal_warehouses.values():
                total_available += warehouse.products.get(product_id, 0)
            
            if total_available < required_qty:
                return False
        
        return True
    
    def find_available_resources(self) -> Dict[str, List[str]]:
        """查找可用资源"""
        available = {
            "terminal_cranes": [],
            "product_cranes": [],
            "frame_trucks": [],
            "frames": []
        }
        
        for crane in self.cranes.values():
            if crane.status == ResourceStatus.IDLE:
                # 判断是末端库还是成品库的行车
                if any(crane.warehouse_id == tw.id for tw in self.terminal_warehouses.values()):
                    available["terminal_cranes"].append(crane.id)
                elif any(crane.warehouse_id == pw.id for pw in self.product_warehouses.values()):
                    available["product_cranes"].append(crane.id)
        
        for truck in self.frame_trucks.values():
            if truck.status == ResourceStatus.IDLE:
                available["frame_trucks"].append(truck.id)
        
        for frame in self.frames.values():
            if frame.status == ResourceStatus.IDLE:
                available["frames"].append(frame.id)
        
        return available
    
    def create_ship_transport_task(self, plan_id: str) -> Optional[Task]:
        """创建船运发货任务"""
        if not self.validate_ship_plan(plan_id):
            self.log_event("ERROR", f"船运计划 {plan_id} 验证失败")
            return None
        
        plan = self.ship_plans[plan_id]
        available_resources = self.find_available_resources()
        
        # 检查是否有足够的资源
        if (not available_resources["terminal_cranes"] or 
            not available_resources["frame_trucks"] or 
            not available_resources["frames"]):
            self.log_event("ERROR", "没有足够的资源执行船运任务")
            return None
        
        # 创建主任务
        task = Task(
            id=f"ship_task_{plan_id}",
            task_type=TaskType.SHIP_TRANSPORT,
            details={"plan_id": plan_id}
        )
        
        # 分配资源
        assigned_crane = available_resources["terminal_cranes"][0]
        assigned_truck = available_resources["frame_trucks"][0]
        assigned_frame = available_resources["frames"][0]
        
        # 创建子任务
        # 1. 框架车头拉框
        pull_task = SubTask(
            id=f"pull_{task.id}",
            task_type=SubTaskType.FRAME_PULLING,
            assigned_resources={"frame_truck": assigned_truck, "frame": assigned_frame},
            details={"source_pos": self.frames[assigned_frame].position, 
                    "target_pos": self.frame_trucks[assigned_truck].position}
        )
        
        # 2. (新增) 运输到末端库
        transport_to_terminal_task = SubTask(
            id=f"transport_to_terminal_{task.id}",
            task_type=SubTaskType.TRANSPORT,
            assigned_resources={"frame_truck": assigned_truck, "frame": assigned_frame},
            details={"source_position": self.frames[assigned_frame].position.__dict__, "target_position": self.terminal_warehouses[assigned_crane].position.__dict__}
        )
        
        # 3. 末端库装货
        loading_task = SubTask(
            id=f"load_{task.id}",
            task_type=SubTaskType.TERMINAL_LOADING,
            assigned_resources={"crane": assigned_crane, "frame": assigned_frame},
            details={"source_warehouse_id": assigned_crane, "products": plan.products}
        )
        
        # 4. 运输到成品库
        transport_to_product_task = SubTask(
            id=f"transport_to_product_{task.id}",
            task_type=SubTaskType.TRANSPORT,
            assigned_resources={"frame_truck": assigned_truck, "frame": assigned_frame},
            details={"source_position": self.terminal_warehouses[assigned_crane].position.__dict__, "target_position": self.product_warehouses[assigned_crane].position.__dict__}
        )
        
        # 5. 成品库卸货
        unloading_task = SubTask(
            id=f"unload_{task.id}",
            task_type=SubTaskType.PRODUCT_UNLOADING,
            assigned_resources={"crane": assigned_crane, "frame": assigned_frame},
            details={"target_warehouse_id": assigned_crane}
        )
        
        # 6. 空框架定位
        frame_parking_pos = self._find_parking_position(assigned_frame)
        positioning_task = SubTask(
            id=f"position_{task.id}",
            task_type=SubTaskType.FRAME_POSITIONING,
            assigned_resources={"frame_truck": assigned_truck, "frame": assigned_frame},
            details={"target_position": frame_parking_pos.__dict__}
        )
        
        task.sub_tasks = [pull_task, transport_to_terminal_task, loading_task, transport_to_product_task, unloading_task, positioning_task]
        self.tasks[task.id] = task
        
        self.log_event("INFO", f"创建船运任务 {task.id}，分配资源：行车{assigned_crane}, 车头{assigned_truck}, 框架{assigned_frame}")
        
        return task
    
    def create_internal_transfer_task(self, source_warehouse_id: str, 
                                    target_warehouse_id: str, 
                                    products: Dict[str, int]) -> Optional[Task]:
        """创建内转任务"""
        self.log_event("INFO", f"创建内转任务: 从 {source_warehouse_id} 到 {target_warehouse_id}")

        # 创建主任务
        task = Task(
            id=f"internal_{source_warehouse_id}_{target_warehouse_id}",
            task_type=TaskType.INTERNAL_TRANSFER,
            details={
                'source_warehouse_id': source_warehouse_id,
                'target_warehouse_id': target_warehouse_id,
                'products': products
            }
        )

        # 分配资源
        source_warehouse = self.terminal_warehouses.get(source_warehouse_id)
        target_warehouse = self.product_warehouses.get(target_warehouse_id)
        
        # 假设每个仓库有且仅有一个关联的行车
        source_crane = next((c for c in self.cranes.values() if c.warehouse_id == source_warehouse_id), None)
        target_crane = next((c for c in self.cranes.values() if c.warehouse_id == target_warehouse_id), None)

        if not all([source_warehouse, target_warehouse, source_crane, target_crane]):
            self.log_event("ERROR", "创建内转任务失败: 找不到仓库或关联的行车")
            return None

        # 创建子任务
        sub_tasks = []
        # 1. 在源仓库装货 (从仓库到虚拟的"运输工具")
        sub_tasks.append(SubTask(
            id=f"load_{task.id}",
            task_type=SubTaskType.TERMINAL_LOADING,
            assigned_resources={'crane': source_crane.id},
            details={
                'source_warehouse_id': source_warehouse.id,
                'products': products
            }
        ))
        
        # 2. 运输 (从源仓库到目标仓库)
        sub_tasks.append(SubTask(
            id=f"transport_{task.id}",
            task_type=SubTaskType.TRANSPORT,
            assigned_resources={}, # 内转简化，不指定具体运输工具
            details={
                'source_warehouse_id': source_warehouse.id,
                'target_warehouse_id': target_warehouse.id,
                'source_position': source_warehouse.position.__dict__,
                'target_position': target_warehouse.position.__dict__
            }
        ))

        # 3. 在目标仓库卸货
        sub_tasks.append(SubTask(
            id=f"unload_{task.id}",
            task_type=SubTaskType.PRODUCT_UNLOADING,
            assigned_resources={'crane': target_crane.id},
            details={
                'target_warehouse_id': target_warehouse.id,
                'products': products
            }
        ))

        task.sub_tasks = sub_tasks
        self.tasks[task.id] = task
        return task
    
    def execute_task(self, task_id: str) -> bool:
        """执行任务"""
        if task_id not in self.tasks:
            return False
        
        task = self.tasks[task_id]
        task.status = ResourceStatus.BUSY
        task.start_time = datetime.now()
        
        self.log_event("INFO", f"开始执行任务 {task_id}")
        
        for sub_task in task.sub_tasks:
            if not self.execute_sub_task(sub_task):
                task.status = ResourceStatus.UNAVAILABLE
                self.log_event("ERROR", f"任务 {task_id} 执行失败")
                return False
        
        task.status = ResourceStatus.IDLE
        task.end_time = datetime.now()
        self.log_event("INFO", f"任务 {task_id} 执行完成")
        
        return True
    
    def execute_sub_task(self, sub_task: SubTask) -> bool:
        """执行子任务"""
        sub_task.status = ResourceStatus.BUSY
        sub_task.start_time = datetime.now()
        
        # 更新资源状态
        for resource_type, resource_id in sub_task.assigned_resources.items():
            if resource_type == "crane":
                self.cranes[resource_id].status = ResourceStatus.BUSY
            elif resource_type == "frame_truck":
                self.frame_trucks[resource_id].status = ResourceStatus.BUSY
            elif resource_type == "frame":
                self.frames[resource_id].status = ResourceStatus.BUSY
        
        # 模拟任务执行
        import time
        time.sleep(0.1)  # 模拟任务执行时间
        
        # 恢复资源状态
        for resource_type, resource_id in sub_task.assigned_resources.items():
            if resource_type == "crane":
                self.cranes[resource_id].status = ResourceStatus.IDLE
            elif resource_type == "frame_truck":
                self.frame_trucks[resource_id].status = ResourceStatus.IDLE
            elif resource_type == "frame":
                self.frames[resource_id].status = ResourceStatus.IDLE
        
        sub_task.status = ResourceStatus.IDLE
        sub_task.end_time = datetime.now()
        
        self.log_event("INFO", f"子任务 {sub_task.id} ({sub_task.task_type.value}) 执行完成")
        
        return True
    
    def log_event(self, level: str, message: str):
        """记录事件日志"""
        self.execution_log.append({
            "timestamp": datetime.now().isoformat(),
            "level": level,
            "message": message
        })
        print(f"[{level}] {message}")
    
    def get_system_status(self) -> Dict[str, Any]:
        """获取系统状态"""
        return {
            "warehouses": {
                "terminal": {wh.id: {"position": str(wh.position), "products": wh.products} 
                           for wh in self.terminal_warehouses.values()},
                "product": {wh.id: {"position": str(wh.position), "products": wh.products} 
                          for wh in self.product_warehouses.values()}
            },
            "resources": self.get_resource_status(),
            "active_tasks": {task.id: task.status.value for task in self.tasks.values() 
                           if task.status != ResourceStatus.IDLE},
            "recent_logs": self.execution_log[-10:]  # 最近10条日志
        }
    
    def optimize_task_scheduling(self) -> List[str]:
        """优化任务调度（简单的优先级排序）"""
        # 根据任务类型和紧急程度排序
        pending_tasks = [task for task in self.tasks.values() if task.status == ResourceStatus.IDLE]
        
        def task_priority(task):
            if task.task_type == TaskType.SHIP_TRANSPORT:
                return 1  # 船运任务优先级高
            return 2
        
        pending_tasks.sort(key=task_priority)
        return [task.id for task in pending_tasks]


# 测试用例
def create_test_system():
    """创建测试系统"""
    system = LogisticsSystem()
    
    # 创建产品
    product1 = Product("P001", "钢材", 10.0, 5.0)
    product2 = Product("P002", "水泥", 8.0, 4.0)
    system.add_product(product1)
    system.add_product(product2)
    
    # 创建仓库
    terminal_wh = TerminalWarehouse("TW001", "末端库1", Position(0, 0), 1000.0)
    terminal_wh.add_product("P001", 100)
    terminal_wh.add_product("P002", 80)
    system.add_terminal_warehouse(terminal_wh)
    
    product_wh = ProductWarehouse("PW001", "成品库1", Position(0, 9), 2000.0)
    system.add_product_warehouse(product_wh)
    
    # 创建行车
    terminal_crane = Crane("C001", "末端库行车1", Position(0, 0), warehouse_id="TW001")
    product_crane = Crane("C002", "成品库行车1", Position(0, 9), warehouse_id="PW001")
    system.add_crane(terminal_crane)
    system.add_crane(product_crane)
    
    # 创建框架和车头
    frame = Frame("F001", "框架1", Position(5, 5))
    truck = FrameTruck("T001", "车头1", Position(5, 4))
    system.add_frame(frame)
    system.add_frame_truck(truck)
    
    return system


def test_ship_transport():
    """测试船运任务"""
    print("=== 测试船运任务 ===")
    system = create_test_system()
    
    # 创建船运计划
    ship_plan = ShipPlan("SP001", {"P001": 50, "P002": 30}, datetime.now() + timedelta(hours=2))
    system.add_ship_plan(ship_plan)
    
    # 创建并执行船运任务
    task = system.create_ship_transport_task("SP001")
    if task:
        system.execute_task(task.id)
    
    # 输出系统状态
    status = system.get_system_status()
    print(json.dumps(status, indent=2, ensure_ascii=False))


def test_internal_transfer():
    """测试内转任务"""
    print("\n=== 测试内转任务 ===")
    system = create_test_system()
    
    # 创建并执行内转任务
    task = system.create_internal_transfer_task("TW001", "PW001", {"P001": 20, "P002": 15})
    if task:
        system.execute_task(task.id)
    
    # 输出系统状态
    status = system.get_system_status()
    print(json.dumps(status, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    # 运行测试
    test_ship_transport()
    test_internal_transfer()
    
    print("\n=== 系统功能演示完成 ===")
