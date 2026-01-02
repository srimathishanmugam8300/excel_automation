from pydantic import BaseModel
from typing import Optional

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    is_first_login: Optional[bool] = None

class LoginRequest(BaseModel):
    username: str
    password: str

class CreateUserRequest(BaseModel):
    user_id: str
    email: Optional[str] = None
    password: str

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

class ForgotPasswordRequest(BaseModel):
    user_id: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class AdminResetUserPasswordRequest(BaseModel):
    user_id: str

# --- Dashboard Schemas ---

class ActivityLogBase(BaseModel):
    user_id: str
    action: str
    detail: Optional[str] = None
    type: str

class ActivityLogCreate(ActivityLogBase):
    pass

class ActivityLog(ActivityLogBase):
    id: int
    timestamp: str

class TriggerRuleBase(BaseModel):
    rule_name: str
    rule_type: str
    project_name: Optional[str] = None
    start_date: Optional[str] = None
    deadline: Optional[str] = None
    frequency: Optional[str] = None
    status: str = 'Active'

class TriggerRuleCreate(TriggerRuleBase):
    pass

class TriggerRule(TriggerRuleBase):
    id: int

class MemoBase(BaseModel):
    user_id: str
    reason: str
    content: str
    date_issued: str
    escalation_level: str
    status: str = 'Open'

class MemoCreate(MemoBase):
    pass

class Memo(MemoBase):
    id: int

class TaskUser(BaseModel):
    user_id: str
    progress: int

class ComplianceTaskBase(BaseModel):
    task_name: str
    deadline: str
    completed: bool = False
    total_progress: int = 0
    users: list[TaskUser] = []

class ComplianceTaskCreate(ComplianceTaskBase):
    pass

class ComplianceTask(ComplianceTaskBase):
    id: int
