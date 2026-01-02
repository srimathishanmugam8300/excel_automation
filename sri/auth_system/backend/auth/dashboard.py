from fastapi import APIRouter, HTTPException, Depends
from typing import List
from db import queries
from schemas import (
    ActivityLog, ActivityLogCreate,
    TriggerRule, TriggerRuleCreate,
    Memo, MemoCreate,
    ComplianceTask, ComplianceTaskCreate
)
from .dependencies import get_current_admin

router = APIRouter()

# --- Activity Logs ---
@router.get("/logs", response_model=List[ActivityLog])
async def get_logs(admin: str = Depends(get_current_admin)):
    logs = queries.get_activity_logs()
    return [dict(l) for l in logs]

@router.post("/logs")
async def create_log(log: ActivityLogCreate, admin: str = Depends(get_current_admin)):
    queries.create_activity_log(log.user_id, log.action, log.detail, log.type)
    return {"message": "Log created"}

@router.put("/logs/{log_id}")
async def update_log(log_id: int, log: ActivityLogCreate, admin: str = Depends(get_current_admin)):
    queries.update_activity_log(log_id, log.user_id, log.action, log.detail, log.type)
    return {"message": "Log updated"}

@router.delete("/logs/{log_id}")
async def delete_log(log_id: int, admin: str = Depends(get_current_admin)):
    queries.delete_activity_log(log_id)
    return {"message": "Log deleted"}

# --- Trigger Rules ---
@router.get("/rules", response_model=List[TriggerRule])
async def get_rules(admin: str = Depends(get_current_admin)):
    rules = queries.get_trigger_rules()
    return [dict(r) for r in rules]

@router.post("/rules")
async def create_rule(rule: TriggerRuleCreate, admin: str = Depends(get_current_admin)):
    queries.create_trigger_rule(rule.rule_name, rule.rule_type, rule.project_name, rule.start_date, rule.deadline, rule.frequency, rule.status)
    return {"message": "Rule created"}

@router.put("/rules/{rule_id}")
async def update_rule(rule_id: int, rule: TriggerRuleCreate, admin: str = Depends(get_current_admin)):
    queries.update_trigger_rule(rule_id, rule.rule_name, rule.rule_type, rule.project_name, rule.start_date, rule.deadline, rule.frequency, rule.status)
    return {"message": "Rule updated"}

@router.delete("/rules/{rule_id}")
async def delete_rule(rule_id: int, admin: str = Depends(get_current_admin)):
    queries.delete_trigger_rule(rule_id)
    return {"message": "Rule deleted"}

# --- Memos ---
@router.get("/memos", response_model=List[Memo])
async def get_memos(admin: str = Depends(get_current_admin)):
    memos = queries.get_memos()
    return [dict(m) for m in memos]

@router.post("/memos")
async def create_memo(memo: MemoCreate, admin: str = Depends(get_current_admin)):
    queries.create_memo(memo.user_id, memo.reason, memo.content, memo.date_issued, memo.escalation_level, memo.status)
    return {"message": "Memo created"}

@router.put("/memos/{memo_id}")
async def update_memo(memo_id: int, memo: MemoCreate, admin: str = Depends(get_current_admin)):
    queries.update_memo(memo_id, memo.user_id, memo.reason, memo.content, memo.date_issued, memo.escalation_level, memo.status)
    return {"message": "Memo updated"}

@router.delete("/memos/{memo_id}")
async def delete_memo(memo_id: int, admin: str = Depends(get_current_admin)):
    queries.delete_memo(memo_id)
    return {"message": "Memo deleted"}

# --- Compliance Tasks ---
@router.get("/tasks", response_model=List[ComplianceTask])
async def get_tasks(admin: str = Depends(get_current_admin)):
    tasks = queries.get_compliance_tasks()
    return tasks

@router.post("/tasks")
async def create_task(task: ComplianceTaskCreate, admin: str = Depends(get_current_admin)):
    queries.create_compliance_task(task.task_name, task.deadline, task.completed, task.total_progress, [dict(u) for u in task.users])
    return {"message": "Task created"}

@router.put("/tasks/{task_id}")
async def update_task(task_id: int, task: ComplianceTaskCreate, admin: str = Depends(get_current_admin)):
    queries.update_compliance_task(task_id, task.task_name, task.deadline, task.completed, task.total_progress, [dict(u) for u in task.users])
    return {"message": "Task updated"}

@router.delete("/tasks/{task_id}")
async def delete_task(task_id: int, admin: str = Depends(get_current_admin)):
    queries.delete_compliance_task(task_id)
    return {"message": "Task deleted"}
