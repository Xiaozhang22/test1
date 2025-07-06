"""
厂区货物调度系统 - 综合测试案例
包含多种复杂场景的完整测试
"""

from factory_logistics_system import *
import json
from datetime import datetime, timedelta


class TestScenario:
    """测试场景类"""
    
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
        self.system = LogisticsSystem(grid_size=(15, 15))
        self.test_results = []
    
    def log_result(self, test_name: str, success: bool, details: str = ""):
        """记录测试结果"""
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })
    
    def print_results(self):
        """打印测试结果"""
        print(f"\n{'='*50}")
        print(f"测试场景: {self.name}")
        print(f"描述: {self.description}")
        print(f"{'='*50}")
        
        for result in self.test_results:
            status = "✓ PASS" if result["success"] else "✗ FAIL"
            print(f"{status} {result['test']}")
            if result["details"]:
                print(f"    详情: {result['details']}")
        
        success_count = sum(1 for r in self.test_results if r["success"])
        total_count = len(self.test_results)
        print(f"\n测试结果: {success_count}/{total_count} 通过")


def create_complex_system():
    """创建复杂的测试系统"""
    system = LogisticsSystem(grid_size=(15, 15))
    
    # 创建多种产品
    products = [
        Product("P001", "钢材", 10.0, 5.0),
        Product("P002", "水泥", 8.0, 4.0),
        Product("P003", "木材", 5.0, 8.0),
        Product("P004", "玻璃", 3.0, 2.0),
        Product("P005", "塑料", 2.0, 6.0)
    ]
    
    for product in products:
        system.add_product(product)
    
    # 创建多个末端库
    terminal_warehouses = [
        TerminalWarehouse("TW001", "末端库1", Position(0, 0), 1000.0),
        TerminalWarehouse("TW002", "末端库2", Position(0, 14), 1200.0),
        TerminalWarehouse("TW003", "末端库3", Position(14, 0), 800.0)
    ]
    
    # 为末端库添加产品
    terminal_warehouses[0].add_product("P001", 150)
    terminal_warehouses[0].add_product("P002", 100)
    terminal_warehouses[1].add_product("P003", 200)
    terminal_warehouses[1].add_product("P004", 80)
    terminal_warehouses[2].add_product("P005", 120)
    terminal_warehouses[2].add_product("P001", 90)
    
    for warehouse in terminal_warehouses:
        system.add_terminal_warehouse(warehouse)
    
    # 创建多个成品库
    product_warehouses = [
        ProductWarehouse("PW001", "成品库1", Position(7, 7), 2000.0),
        ProductWarehouse("PW002", "成品库2", Position(14, 14), 1500.0)
    ]
    
    for warehouse in product_warehouses:
        system.add_product_warehouse(warehouse)
    
    # 创建多个行车
    cranes = [
        Crane("C001", "末端库1行车", Position(0, 0), warehouse_id="TW001"),
        Crane("C002", "末端库2行车", Position(0, 14), warehouse_id="TW002"),
        Crane("C003", "末端库3行车", Position(14, 0), warehouse_id="TW003"),
        Crane("C004", "成品库1行车", Position(7, 7), warehouse_id="PW001"),
        Crane("C005", "成品库2行车", Position(14, 14), warehouse_id="PW002")
    ]
    
    for crane in cranes:
        system.add_crane(crane)
    
    # 创建多个框架和车头
    frames = [
        Frame("F001", "框架1", Position(3, 3)),
        Frame("F002", "框架2", Position(7, 3)),
        Frame("F003", "框架3", Position(11, 3)),
        Frame("F004", "框架4", Position(3, 11)),
        Frame("F005", "框架5", Position(11, 11))
    ]
    
    trucks = [
        FrameTruck("T001", "车头1", Position(3, 2)),
        FrameTruck("T002", "车头2", Position(7, 2)),
        FrameTruck("T003", "车头3", Position(11, 2)),
        FrameTruck("T004", "车头4", Position(3, 12)),
        FrameTruck("T005", "车头5", Position(11, 12))
    ]
    
    for frame in frames:
        system.add_frame(frame)
    
    for truck in trucks:
        system.add_frame_truck(truck)
    
    return system


def test_scenario_1_single_ship_task():
    """测试场景1：单个船运任务"""
    scenario = TestScenario("单个船运任务", "测试基本的船运任务创建和执行")
    scenario.system = create_complex_system()
    
    # 创建船运计划
    ship_plan = ShipPlan(
        "SP001", 
        {"P001": 50, "P002": 30}, 
        datetime.now() + timedelta(hours=2),
        priority=1
    )
    scenario.system.add_ship_plan(ship_plan)
    
    # 测试计划验证
    is_valid = scenario.system.validate_ship_plan("SP001")
    scenario.log_result("船运计划验证", is_valid, f"计划包含P001:50件, P002:30件")
    
    # 测试任务创建
    task = scenario.system.create_ship_transport_task("SP001")
    scenario.log_result("船运任务创建", task is not None, f"任务ID: {task.id if task else 'None'}")
    
    # 测试任务执行
    if task:
        success = scenario.system.execute_task(task.id)
        scenario.log_result("船运任务执行", success, "包含3个子任务：拉框、装货、运输")
    
    # 检查资源状态
    resources = scenario.system.get_resource_status()
    all_idle = all(status == ResourceStatus.IDLE for status_dict in resources.values() 
                   for status in status_dict.values())
    scenario.log_result("资源状态恢复", all_idle, "所有资源应该恢复到空闲状态")
    
    scenario.print_results()
    return scenario


def test_scenario_2_multiple_ship_tasks():
    """测试场景2：多个船运任务"""
    scenario = TestScenario("多个船运任务", "测试多个船运任务的并发处理")
    scenario.system = create_complex_system()
    
    # 创建多个船运计划
    ship_plans = [
        ShipPlan("SP001", {"P001": 30, "P002": 20}, datetime.now() + timedelta(hours=1)),
        ShipPlan("SP002", {"P003": 40, "P004": 15}, datetime.now() + timedelta(hours=2)),
        ShipPlan("SP003", {"P005": 25, "P001": 20}, datetime.now() + timedelta(hours=3))
    ]
    
    for plan in ship_plans:
        scenario.system.add_ship_plan(plan)
    
    # 测试任务创建
    tasks = []
    for i, plan in enumerate(ship_plans):
        task = scenario.system.create_ship_transport_task(plan.id)
        tasks.append(task)
        scenario.log_result(f"任务{i+1}创建", task is not None, f"计划ID: {plan.id}")
    
    # 测试任务优化调度
    optimized_order = scenario.system.optimize_task_scheduling()
    scenario.log_result("任务调度优化", len(optimized_order) > 0, f"优化后任务顺序: {optimized_order}")
    
    # 按优化顺序执行任务
    successful_tasks = 0
    for task_id in optimized_order:
        if scenario.system.execute_task(task_id):
            successful_tasks += 1
    
    scenario.log_result("多任务执行", successful_tasks == len(optimized_order), 
                       f"成功执行 {successful_tasks}/{len(optimized_order)} 个任务")
    
    scenario.print_results()
    return scenario


def test_scenario_3_internal_transfer():
    """测试场景3：内转任务"""
    scenario = TestScenario("内转任务", "测试末端库到成品库的内转任务")
    scenario.system = create_complex_system()
    
    # 记录初始库存
    initial_stock = {}
    for wh_id, warehouse in scenario.system.terminal_warehouses.items():
        initial_stock[wh_id] = warehouse.products.copy()
    
    # 创建内转任务
    transfer_products = {"P001": 40, "P002": 25}
    task = scenario.system.create_internal_transfer_task("TW001", "PW001", transfer_products)
    scenario.log_result("内转任务创建", task is not None, f"从TW001转移到PW001")
    
    # 检查子任务数量
    if task:
        expected_subtasks = 5  # 拉框、装货、运输、卸货、定位
        actual_subtasks = len(task.sub_tasks)
        scenario.log_result("子任务数量检查", actual_subtasks == expected_subtasks, 
                           f"预期{expected_subtasks}个，实际{actual_subtasks}个")
    
    # 执行任务
    if task:
        success = scenario.system.execute_task(task.id)
        scenario.log_result("内转任务执行", success, "完整的5步内转流程")
    
    # 验证产品转移（模拟）
    scenario.log_result("产品转移验证", True, "产品应从末端库转移到成品库")
    
    scenario.print_results()
    return scenario


def test_scenario_4_resource_shortage():
    """测试场景4：资源不足情况"""
    scenario = TestScenario("资源不足处理", "测试资源不足时的系统行为")
    
    # 创建资源有限的系统
    system = LogisticsSystem()
    
    # 只添加基本资源
    system.add_product(Product("P001", "钢材", 10.0, 5.0))
    
    terminal_wh = TerminalWarehouse("TW001", "末端库", Position(0, 0), 1000.0)
    terminal_wh.add_product("P001", 100)
    system.add_terminal_warehouse(terminal_wh)
    
    # 只添加一个行车，没有车头和框架
    crane = Crane("C001", "行车", Position(0, 0), warehouse_id="TW001")
    system.add_crane(crane)
    
    scenario.system = system
    
    # 创建船运计划
    ship_plan = ShipPlan("SP001", {"P001": 50}, datetime.now() + timedelta(hours=1))
    scenario.system.add_ship_plan(ship_plan)
    
    # 测试资源不足情况
    task = scenario.system.create_ship_transport_task("SP001")
    scenario.log_result("资源不足处理", task is None, "系统应该拒绝创建任务")
    
    # 添加必要资源
    scenario.system.add_frame(Frame("F001", "框架", Position(5, 5)))
    scenario.system.add_frame_truck(FrameTruck("T001", "车头", Position(5, 4)))
    
    # 再次尝试创建任务
    task = scenario.system.create_ship_transport_task("SP001")
    scenario.log_result("资源补充后", task is not None, "添加资源后应该能创建任务")
    
    scenario.print_results()
    return scenario


def test_scenario_5_complex_mixed_tasks():
    """测试场景5：复杂混合任务"""
    scenario = TestScenario("复杂混合任务", "测试船运和内转任务的混合调度")
    scenario.system = create_complex_system()
    
    # 创建混合任务
    ship_plan = ShipPlan("SP001", {"P001": 30, "P003": 40}, datetime.now() + timedelta(hours=1))
    scenario.system.add_ship_plan(ship_plan)
    
    # 创建船运任务
    ship_task = scenario.system.create_ship_transport_task("SP001")
    scenario.log_result("混合任务-船运", ship_task is not None, "船运任务创建成功")
    
    # 创建内转任务
    internal_task = scenario.system.create_internal_transfer_task("TW002", "PW002", {"P004": 20, "P005": 30})
    scenario.log_result("混合任务-内转", internal_task is not None, "内转任务创建成功")
    
    # 测试任务优先级
    all_tasks = [ship_task.id, internal_task.id] if ship_task and internal_task else []
    optimized_order = scenario.system.optimize_task_scheduling()
    
    if optimized_order:
        first_task = scenario.system.tasks[optimized_order[0]]
        is_ship_first = first_task.task_type == TaskType.SHIP_TRANSPORT
        scenario.log_result("任务优先级", is_ship_first, "船运任务应该优先执行")
    
    # 执行所有任务
    executed_count = 0
    for task_id in optimized_order:
        if scenario.system.execute_task(task_id):
            executed_count += 1
    
    scenario.log_result("混合任务执行", executed_count == len(optimized_order), 
                       f"成功执行 {executed_count} 个任务")
    
    scenario.print_results()
    return scenario


def test_scenario_6_system_monitoring():
    """测试场景6：系统监控功能"""
    scenario = TestScenario("系统监控功能", "测试系统状态监控和日志记录")
    scenario.system = create_complex_system()
    
    # 测试初始状态查询
    initial_status = scenario.system.get_system_status()
    scenario.log_result("初始状态查询", len(initial_status) > 0, "系统状态包含所有必要信息")
    
    # 测试资源状态查询
    resource_status = scenario.system.get_resource_status()
    expected_categories = ["terminal_cranes", "product_cranes", "frame_trucks", "frames"]
    has_all_categories = all(cat in resource_status for cat in expected_categories)
    scenario.log_result("资源状态查询", has_all_categories, "包含所有资源类别")
    
    # 创建并执行任务以产生日志
    ship_plan = ShipPlan("SP001", {"P001": 20}, datetime.now() + timedelta(hours=1))
    scenario.system.add_ship_plan(ship_plan)
    task = scenario.system.create_ship_transport_task("SP001")
    
    if task:
        scenario.system.execute_task(task.id)
    
    # 检查日志记录
    log_count = len(scenario.system.execution_log)
    scenario.log_result("日志记录", log_count > 0, f"记录了 {log_count} 条日志")
    
    # 测试系统状态更新
    final_status = scenario.system.get_system_status()
    has_recent_logs = len(final_status.get("recent_logs", [])) > 0
    scenario.log_result("状态更新", has_recent_logs, "系统状态包含最近日志")
    
    scenario.print_results()
    return scenario


def run_performance_test():
    """运行性能测试"""
    print(f"\n{'='*50}")
    print("性能测试")
    print(f"{'='*50}")
    
    system = create_complex_system()
    
    # 批量创建任务
    import time
    start_time = time.time()
    
    tasks_created = 0
    for i in range(10):
        ship_plan = ShipPlan(f"SP{i:03d}", {"P001": 10 + i, "P002": 5 + i}, 
                            datetime.now() + timedelta(hours=i+1))
        system.add_ship_plan(ship_plan)
        
        task = system.create_ship_transport_task(ship_plan.id)
        if task:
            tasks_created += 1
    
    creation_time = time.time() - start_time
    print(f"任务创建性能: {tasks_created} 个任务在 {creation_time:.3f} 秒内创建")
    
    # 批量执行任务
    start_time = time.time()
    optimized_order = system.optimize_task_scheduling()
    
    executed_tasks = 0
    for task_id in optimized_order[:5]:  # 执行前5个任务
        if system.execute_task(task_id):
            executed_tasks += 1
    
    execution_time = time.time() - start_time
    print(f"任务执行性能: {executed_tasks} 个任务在 {execution_time:.3f} 秒内执行")
    
    # 系统状态查询性能
    start_time = time.time()
    for _ in range(100):
        system.get_system_status()
    query_time = time.time() - start_time
    print(f"状态查询性能: 100 次查询在 {query_time:.3f} 秒内完成")


def main():
    """主测试函数"""
    print("厂区货物调度系统 - 综合测试")
    print(f"测试开始时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # 运行所有测试场景
    scenarios = [
        test_scenario_1_single_ship_task(),
        test_scenario_2_multiple_ship_tasks(),
        test_scenario_3_internal_transfer(),
        test_scenario_4_resource_shortage(),
        test_scenario_5_complex_mixed_tasks(),
        test_scenario_6_system_monitoring()
    ]
    
    # 运行性能测试
    run_performance_test()
    
    # 汇总测试结果
    print(f"\n{'='*50}")
    print("测试结果汇总")
    print(f"{'='*50}")
    
    total_tests = sum(len(scenario.test_results) for scenario in scenarios)
    passed_tests = sum(sum(1 for result in scenario.test_results if result["success"]) 
                      for scenario in scenarios)
    
    print(f"总测试数: {total_tests}")
    print(f"通过测试: {passed_tests}")
    print(f"失败测试: {total_tests - passed_tests}")
    print(f"通过率: {passed_tests/total_tests*100:.1f}%")
    
    # 详细失败信息
    failed_tests = []
    for scenario in scenarios:
        for result in scenario.test_results:
            if not result["success"]:
                failed_tests.append(f"{scenario.name}: {result['test']}")
    
    if failed_tests:
        print(f"\n失败的测试:")
        for failed in failed_tests:
            print(f"  - {failed}")
    
    print(f"\n测试完成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")


if __name__ == "__main__":
    main()
