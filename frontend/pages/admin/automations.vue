<template>
  <div class="p-8">
    <div class="mb-8">
      <NuxtLink to="/admin" class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-2 inline-block">
        ← Back to Admin
      </NuxtLink>
      <h1 class="text-3xl font-bold mb-2">Automations</h1>
      <p class="text-gray-600 dark:text-gray-400">Create powerful automation rules to streamline your workflow</p>
    </div>

    <div class="card">
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">Automation Rules</h2>
          <button @click="openAutomationModal()" class="btn btn-primary">
            + Create Automation
          </button>
        </div>
      </div>
      <div class="p-6">
        <div v-if="loading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <div v-else-if="automations.length === 0" class="text-center py-8 text-gray-500">
          No automations configured. Create your first automation rule to get started.
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="automation in automations"
            :key="automation.id"
            class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <span class="font-semibold">{{ automation.name }}</span>
                  <span
                    :class="[
                      'px-2 py-1 text-xs rounded',
                      automation.is_enabled
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                    ]"
                  >
                    {{ automation.is_enabled ? 'Enabled' : 'Disabled' }}
                  </span>
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <div><strong>When:</strong> {{ formatTriggerDisplay(automation.trigger) }}</div>
                  <div v-if="automation.conditions && automation.conditions.length > 0">
                    <strong>If:</strong> {{ formatConditionsDisplay(automation.conditions) }}
                  </div>
                  <div><strong>Then:</strong> {{ formatActionsDisplay(automation.actions) }}</div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click="toggleAutomation(automation)"
                  :class="[
                    'px-3 py-1 text-sm rounded',
                    automation.is_enabled
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      : 'bg-green-200 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  ]"
                >
                  {{ automation.is_enabled ? 'Disable' : 'Enable' }}
                </button>
                <button
                  @click="openAutomationModal(automation)"
                  class="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click="deleteAutomation(automation.id)"
                  class="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Automation Modal -->
    <div v-if="showAutomationModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="closeAutomationModal">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-xl font-semibold">{{ editingAutomation ? 'Edit Automation' : 'Create Automation' }}</h3>
        </div>
        <form @submit.prevent="saveAutomation" class="p-6 space-y-6">
          <!-- Name -->
          <div>
            <label class="block text-sm font-medium mb-2">Automation Name *</label>
            <input
              v-model="automationForm.name"
              type="text"
              required
              class="input"
              placeholder="e.g., Auto-assign urgent tasks to senior team"
            />
          </div>

          <!-- TRIGGER SECTION -->
          <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 class="font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              WHEN (Trigger)
            </h4>
            
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium mb-1">Trigger Event *</label>
                <select v-model="automationForm.trigger.type" required class="input" @change="onTriggerTypeChange">
                  <optgroup label="Task Events">
                    <option value="task_created">Task is created</option>
                    <option value="task_updated">Task is updated</option>
                    <option value="task_deleted">Task is deleted</option>
                  </optgroup>
                  <optgroup label="Status Events">
                    <option value="status_changed">Status changes</option>
                    <option value="status_changed_to">Status changes to specific value</option>
                    <option value="status_changed_from">Status changes from specific value</option>
                  </optgroup>
                  <optgroup label="Assignment Events">
                    <option value="assignee_changed">Assignee changes</option>
                    <option value="task_assigned">Task is assigned (was unassigned)</option>
                    <option value="task_unassigned">Task is unassigned</option>
                  </optgroup>
                  <optgroup label="Date Events">
                    <option value="due_date_approaching">Due date approaching</option>
                    <option value="due_date_passed">Due date passed (overdue)</option>
                    <option value="due_date_set">Due date is set</option>
                  </optgroup>
                  <optgroup label="Priority Events">
                    <option value="priority_changed">Priority changes</option>
                    <option value="priority_set_high">Priority set to High or Urgent</option>
                  </optgroup>
                  <optgroup label="Collaboration Events">
                    <option value="comment_added">Comment is added</option>
                    <option value="attachment_added">Attachment is added</option>
                    <option value="watcher_added">Watcher is added</option>
                    <option value="label_added">Label is added</option>
                  </optgroup>
                  <optgroup label="Workflow Events">
                    <option value="approval_requested">Approval is requested</option>
                    <option value="approval_approved">Approval is approved</option>
                    <option value="approval_rejected">Approval is rejected</option>
                    <option value="sla_warning">SLA warning threshold reached</option>
                    <option value="sla_breached">SLA is breached</option>
                  </optgroup>
                  <optgroup label="Scheduled">
                    <option value="schedule_daily">Daily at specific time</option>
                    <option value="schedule_weekly">Weekly on specific day</option>
                  </optgroup>
                </select>
              </div>

              <!-- Trigger-specific options -->
              <div v-if="triggerNeedsStatus" class="grid grid-cols-2 gap-3">
                <div v-if="automationForm.trigger.type === 'status_changed_from' || automationForm.trigger.type === 'status_changed'">
                  <label class="block text-sm font-medium mb-1">From Status</label>
                  <select v-model="automationForm.trigger.from_status_id" class="input">
                    <option value="">Any status</option>
                    <option v-for="status in statuses" :key="status.id" :value="status.id">{{ status.name }}</option>
                  </select>
                </div>
                <div v-if="automationForm.trigger.type === 'status_changed_to' || automationForm.trigger.type === 'status_changed'">
                  <label class="block text-sm font-medium mb-1">To Status</label>
                  <select v-model="automationForm.trigger.to_status_id" class="input">
                    <option value="">Any status</option>
                    <option v-for="status in statuses" :key="status.id" :value="status.id">{{ status.name }}</option>
                  </select>
                </div>
              </div>

              <div v-if="automationForm.trigger.type === 'due_date_approaching'">
                <label class="block text-sm font-medium mb-1">Days before due date</label>
                <select v-model="automationForm.trigger.days_before" class="input">
                  <option value="1">1 day before</option>
                  <option value="2">2 days before</option>
                  <option value="3">3 days before</option>
                  <option value="5">5 days before</option>
                  <option value="7">1 week before</option>
                </select>
              </div>

              <div v-if="automationForm.trigger.type === 'label_added'">
                <label class="block text-sm font-medium mb-1">Specific Label (optional)</label>
                <select v-model="automationForm.trigger.label_id" class="input">
                  <option value="">Any label</option>
                  <option v-for="label in labels" :key="label.id" :value="label.id">{{ label.name }}</option>
                </select>
              </div>

              <div v-if="automationForm.trigger.type === 'schedule_daily'">
                <label class="block text-sm font-medium mb-1">Time (24h format)</label>
                <input v-model="automationForm.trigger.schedule_time" type="time" class="input" />
              </div>

              <div v-if="automationForm.trigger.type === 'schedule_weekly'" class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium mb-1">Day of Week</label>
                  <select v-model="automationForm.trigger.schedule_day" class="input">
                    <option value="1">Monday</option>
                    <option value="2">Tuesday</option>
                    <option value="3">Wednesday</option>
                    <option value="4">Thursday</option>
                    <option value="5">Friday</option>
                    <option value="6">Saturday</option>
                    <option value="0">Sunday</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">Time</label>
                  <input v-model="automationForm.trigger.schedule_time" type="time" class="input" />
                </div>
              </div>
            </div>
          </div>

          <!-- CONDITIONS SECTION -->
          <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <h4 class="font-semibold text-yellow-800 dark:text-yellow-300 mb-3 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              IF (Conditions) - Optional
            </h4>
            
            <div v-if="automationForm.conditions.length > 1" class="mb-3">
              <label class="block text-sm font-medium mb-1">Match</label>
              <select v-model="automationForm.condition_logic" class="input w-auto">
                <option value="all">ALL conditions (AND)</option>
                <option value="any">ANY condition (OR)</option>
              </select>
            </div>

            <div class="space-y-3">
              <div 
                v-for="(condition, index) in automationForm.conditions" 
                :key="index" 
                class="bg-white dark:bg-gray-700 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800"
              >
                <div class="flex items-start gap-2">
                  <div class="flex-1 grid grid-cols-3 gap-2">
                    <div>
                      <label class="block text-xs text-gray-500 mb-1">Field</label>
                      <select v-model="condition.field" class="input text-sm" @change="onConditionFieldChange(condition)">
                        <optgroup label="Task Fields">
                          <option value="status_id">Status</option>
                          <option value="priority">Priority</option>
                          <option value="assignee_id">Assignee</option>
                        </optgroup>
                        <optgroup label="Organization">
                          <option value="project_id">Project</option>
                          <option value="product_id">Product</option>
                          <option value="team_id">Team</option>
                          <option value="agency_id">Agency</option>
                        </optgroup>
                        <optgroup label="Dates">
                          <option value="due_date">Due Date</option>
                          <option value="created_at">Created Date</option>
                        </optgroup>
                        <optgroup label="Other">
                          <option value="has_label">Has Label</option>
                          <option value="has_assignee">Has Assignee</option>
                          <option value="has_due_date">Has Due Date</option>
                          <option value="title">Title</option>
                          <option value="description">Description</option>
                        </optgroup>
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs text-gray-500 mb-1">Operator</label>
                      <select v-model="condition.operator" class="input text-sm">
                        <template v-if="getFieldType(condition.field) === 'select'">
                          <option value="equals">Is</option>
                          <option value="not_equals">Is not</option>
                        </template>
                        <template v-else-if="getFieldType(condition.field) === 'boolean'">
                          <option value="is_true">Yes</option>
                          <option value="is_false">No</option>
                        </template>
                        <template v-else-if="getFieldType(condition.field) === 'date'">
                          <option value="equals">Is</option>
                          <option value="before">Is before</option>
                          <option value="after">Is after</option>
                          <option value="within_days">Within X days</option>
                        </template>
                        <template v-else>
                          <option value="equals">Equals</option>
                          <option value="not_equals">Does not equal</option>
                          <option value="contains">Contains</option>
                          <option value="not_contains">Does not contain</option>
                          <option value="starts_with">Starts with</option>
                          <option value="ends_with">Ends with</option>
                          <option value="is_empty">Is empty</option>
                          <option value="is_not_empty">Is not empty</option>
                        </template>
                      </select>
                    </div>
                    <div v-if="!['is_true', 'is_false', 'is_empty', 'is_not_empty'].includes(condition.operator)">
                      <label class="block text-xs text-gray-500 mb-1">Value</label>
                      <!-- Status dropdown -->
                      <select v-if="condition.field === 'status_id'" v-model="condition.value" class="input text-sm">
                        <option v-for="status in statuses" :key="status.id" :value="status.id">{{ status.name }}</option>
                      </select>
                      <!-- Priority dropdown -->
                      <select v-else-if="condition.field === 'priority'" v-model="condition.value" class="input text-sm">
                        <option value="0">Low</option>
                        <option value="1">Medium</option>
                        <option value="2">High</option>
                        <option value="3">Urgent</option>
                      </select>
                      <!-- User dropdown -->
                      <select v-else-if="condition.field === 'assignee_id'" v-model="condition.value" class="input text-sm">
                        <option v-for="user in users" :key="user.id" :value="user.id">{{ user.full_name || user.email }}</option>
                      </select>
                      <!-- Project dropdown -->
                      <select v-else-if="condition.field === 'project_id'" v-model="condition.value" class="input text-sm">
                        <option v-for="project in projects" :key="project.id" :value="project.id">{{ project.name }}</option>
                      </select>
                      <!-- Product dropdown -->
                      <select v-else-if="condition.field === 'product_id'" v-model="condition.value" class="input text-sm">
                        <option v-for="product in products" :key="product.id" :value="product.id">{{ product.name }}</option>
                      </select>
                      <!-- Team dropdown -->
                      <select v-else-if="condition.field === 'team_id'" v-model="condition.value" class="input text-sm">
                        <option v-for="team in teams" :key="team.id" :value="team.id">{{ team.name }}</option>
                      </select>
                      <!-- Agency dropdown -->
                      <select v-else-if="condition.field === 'agency_id'" v-model="condition.value" class="input text-sm">
                        <option v-for="agency in agencies" :key="agency.id" :value="agency.id">{{ agency.name }}</option>
                      </select>
                      <!-- Label dropdown -->
                      <select v-else-if="condition.field === 'has_label'" v-model="condition.value" class="input text-sm">
                        <option v-for="label in labels" :key="label.id" :value="label.id">{{ label.name }}</option>
                      </select>
                      <!-- Date input -->
                      <input v-else-if="getFieldType(condition.field) === 'date' && condition.operator !== 'within_days'" v-model="condition.value" type="date" class="input text-sm" />
                      <!-- Days number input -->
                      <input v-else-if="condition.operator === 'within_days'" v-model="condition.value" type="number" class="input text-sm" placeholder="Number of days" />
                      <!-- Text input -->
                      <input v-else v-model="condition.value" type="text" class="input text-sm" placeholder="Enter value" />
                    </div>
                  </div>
                  <button type="button" @click="removeCondition(index)" class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <button type="button" @click="addCondition" class="text-sm text-yellow-700 dark:text-yellow-400 hover:underline flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Condition
              </button>
            </div>
          </div>

          <!-- ACTIONS SECTION -->
          <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <h4 class="font-semibold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              THEN (Actions) *
            </h4>

            <div class="space-y-3">
              <div 
                v-for="(action, index) in automationForm.actions" 
                :key="index" 
                class="bg-white dark:bg-gray-700 rounded-lg p-3 border border-green-200 dark:border-green-800"
              >
                <div class="flex items-start gap-2">
                  <div class="flex-1 space-y-2">
                    <div>
                      <label class="block text-xs text-gray-500 mb-1">Action Type</label>
                      <select v-model="action.type" class="input text-sm" @change="onActionTypeChange(action)">
                        <optgroup label="Update Task">
                          <option value="change_status">Change Status</option>
                          <option value="change_assignee">Change Assignee</option>
                          <option value="change_priority">Change Priority</option>
                          <option value="set_due_date">Set Due Date</option>
                          <option value="clear_due_date">Clear Due Date</option>
                        </optgroup>
                        <optgroup label="Labels">
                          <option value="add_label">Add Label</option>
                          <option value="remove_label">Remove Label</option>
                          <option value="clear_labels">Clear All Labels</option>
                        </optgroup>
                        <optgroup label="Collaboration">
                          <option value="add_watcher">Add Watcher</option>
                          <option value="remove_watcher">Remove Watcher</option>
                          <option value="add_comment">Add Comment</option>
                        </optgroup>
                        <optgroup label="Notifications">
                          <option value="send_email">Send Email</option>
                          <option value="send_notification">Send In-App Notification</option>
                        </optgroup>
                        <optgroup label="Workflow">
                          <option value="create_subtask">Create Subtask</option>
                          <option value="trigger_approval">Trigger Approval Workflow</option>
                          <option value="move_to_project">Move to Project</option>
                        </optgroup>
                        <optgroup label="External">
                          <option value="webhook">Call Webhook</option>
                        </optgroup>
                      </select>
                    </div>

                    <!-- Action-specific fields -->
                    <div class="action-config">
                      <!-- Change Status -->
                      <div v-if="action.type === 'change_status'">
                        <label class="block text-xs text-gray-500 mb-1">New Status</label>
                        <select v-model="action.status_id" class="input text-sm">
                          <option v-for="status in statuses" :key="status.id" :value="status.id">{{ status.name }}</option>
                        </select>
                      </div>

                      <!-- Change Assignee -->
                      <div v-if="action.type === 'change_assignee'">
                        <label class="block text-xs text-gray-500 mb-1">Assign To</label>
                        <select v-model="action.assignee_id" class="input text-sm">
                          <option value="__trigger_user__">User who triggered the automation</option>
                          <option value="__project_owner__">Project Owner</option>
                          <option value="__unassign__">Unassign (remove assignee)</option>
                          <option disabled>──────────</option>
                          <option v-for="user in users" :key="user.id" :value="user.id">{{ user.full_name || user.email }}</option>
                        </select>
                      </div>

                      <!-- Change Priority -->
                      <div v-if="action.type === 'change_priority'">
                        <label class="block text-xs text-gray-500 mb-1">New Priority</label>
                        <select v-model="action.priority" class="input text-sm">
                          <option value="0">Low</option>
                          <option value="1">Medium</option>
                          <option value="2">High</option>
                          <option value="3">Urgent</option>
                        </select>
                      </div>

                      <!-- Set Due Date -->
                      <div v-if="action.type === 'set_due_date'" class="space-y-2">
                        <div>
                          <label class="block text-xs text-gray-500 mb-1">Due Date Type</label>
                          <select v-model="action.due_date_type" class="input text-sm">
                            <option value="specific">Specific Date</option>
                            <option value="relative">Relative (days from now)</option>
                            <option value="end_of_week">End of Current Week</option>
                            <option value="end_of_month">End of Current Month</option>
                          </select>
                        </div>
                        <div v-if="action.due_date_type === 'specific'">
                          <label class="block text-xs text-gray-500 mb-1">Date</label>
                          <input v-model="action.due_date" type="date" class="input text-sm" />
                        </div>
                        <div v-if="action.due_date_type === 'relative'">
                          <label class="block text-xs text-gray-500 mb-1">Days from trigger</label>
                          <input v-model="action.days_from_now" type="number" class="input text-sm" placeholder="e.g., 7" />
                        </div>
                      </div>

                      <!-- Add/Remove Label -->
                      <div v-if="action.type === 'add_label' || action.type === 'remove_label'">
                        <label class="block text-xs text-gray-500 mb-1">Label</label>
                        <select v-model="action.label_id" class="input text-sm">
                          <option v-for="label in labels" :key="label.id" :value="label.id">{{ label.name }}</option>
                        </select>
                      </div>

                      <!-- Add/Remove Watcher -->
                      <div v-if="action.type === 'add_watcher' || action.type === 'remove_watcher'">
                        <label class="block text-xs text-gray-500 mb-1">User</label>
                        <select v-model="action.user_id" class="input text-sm">
                          <option value="__trigger_user__">User who triggered the automation</option>
                          <option value="__assignee__">Current Assignee</option>
                          <option value="__project_owner__">Project Owner</option>
                          <option disabled>──────────</option>
                          <option v-for="user in users" :key="user.id" :value="user.id">{{ user.full_name || user.email }}</option>
                        </select>
                      </div>

                      <!-- Add Comment -->
                      <div v-if="action.type === 'add_comment'">
                        <label class="block text-xs text-gray-500 mb-1">Comment Text</label>
                        <textarea v-model="action.comment" class="input text-sm" rows="2" placeholder="Use {{task.title}}, {{task.assignee}}, {{trigger.user}} for dynamic values"></textarea>
                        <p class="text-xs text-gray-400 mt-1">Available variables: {{task.title}}, {{task.assignee}}, {{trigger.user}}, {{task.project}}</p>
                      </div>

                      <!-- Send Email -->
                      <div v-if="action.type === 'send_email'" class="space-y-2">
                        <div>
                          <label class="block text-xs text-gray-500 mb-1">Send To</label>
                          <select v-model="action.email_recipient" class="input text-sm">
                            <option value="assignee">Task Assignee</option>
                            <option value="creator">Task Creator</option>
                            <option value="watchers">All Watchers</option>
                            <option value="project_owner">Project Owner</option>
                            <option value="trigger_user">User Who Triggered</option>
                            <option value="specific">Specific Email Address</option>
                            <option value="specific_user">Specific User</option>
                          </select>
                        </div>
                        <div v-if="action.email_recipient === 'specific'">
                          <label class="block text-xs text-gray-500 mb-1">Email Address</label>
                          <input v-model="action.email_address" type="email" class="input text-sm" placeholder="email@example.com" />
                        </div>
                        <div v-if="action.email_recipient === 'specific_user'">
                          <label class="block text-xs text-gray-500 mb-1">Select User</label>
                          <select v-model="action.email_user_id" class="input text-sm">
                            <option v-for="user in users" :key="user.id" :value="user.id">{{ user.full_name || user.email }}</option>
                          </select>
                        </div>
                        <div>
                          <label class="block text-xs text-gray-500 mb-1">Email Subject</label>
                          <input v-model="action.email_subject" type="text" class="input text-sm" placeholder="e.g., Task {{task.title}} needs attention" />
                        </div>
                        <div>
                          <label class="block text-xs text-gray-500 mb-1">Email Body</label>
                          <textarea v-model="action.email_body" class="input text-sm" rows="3" placeholder="Hi {{recipient.name}},&#10;&#10;Task &quot;{{task.title}}&quot; requires your attention."></textarea>
                        </div>
                        <p class="text-xs text-gray-400">Variables: {{task.title}}, {{task.url}}, {{task.assignee}}, {{task.project}}, {{recipient.name}}, {{trigger.user}}</p>
                      </div>

                      <!-- Send Notification -->
                      <div v-if="action.type === 'send_notification'" class="space-y-2">
                        <div>
                          <label class="block text-xs text-gray-500 mb-1">Notify</label>
                          <select v-model="action.notify_recipient" class="input text-sm">
                            <option value="assignee">Task Assignee</option>
                            <option value="creator">Task Creator</option>
                            <option value="watchers">All Watchers</option>
                            <option value="project_owner">Project Owner</option>
                            <option value="specific_user">Specific User</option>
                          </select>
                        </div>
                        <div v-if="action.notify_recipient === 'specific_user'">
                          <label class="block text-xs text-gray-500 mb-1">Select User</label>
                          <select v-model="action.notify_user_id" class="input text-sm">
                            <option v-for="user in users" :key="user.id" :value="user.id">{{ user.full_name || user.email }}</option>
                          </select>
                        </div>
                        <div>
                          <label class="block text-xs text-gray-500 mb-1">Message</label>
                          <input v-model="action.notification_message" type="text" class="input text-sm" placeholder="Task {{task.title}} has been updated" />
                        </div>
                      </div>

                      <!-- Create Subtask -->
                      <div v-if="action.type === 'create_subtask'" class="space-y-2">
                        <div>
                          <label class="block text-xs text-gray-500 mb-1">Subtask Title</label>
                          <input v-model="action.subtask_title" type="text" class="input text-sm" placeholder="e.g., Review {{task.title}}" />
                        </div>
                        <div>
                          <label class="block text-xs text-gray-500 mb-1">Assign Subtask To (optional)</label>
                          <select v-model="action.subtask_assignee" class="input text-sm">
                            <option value="">Same as parent task</option>
                            <option value="__trigger_user__">User who triggered</option>
                            <option value="__unassigned__">Leave unassigned</option>
                            <option disabled>──────────</option>
                            <option v-for="user in users" :key="user.id" :value="user.id">{{ user.full_name || user.email }}</option>
                          </select>
                        </div>
                      </div>

                      <!-- Trigger Approval -->
                      <div v-if="action.type === 'trigger_approval'">
                        <label class="block text-xs text-gray-500 mb-1">Approval Workflow</label>
                        <select v-model="action.workflow_id" class="input text-sm">
                          <option v-for="workflow in approvalWorkflows" :key="workflow.id" :value="workflow.id">{{ workflow.name }}</option>
                        </select>
                        <p v-if="approvalWorkflows.length === 0" class="text-xs text-gray-400 mt-1">No approval workflows configured. <NuxtLink to="/admin/approval-workflows" class="text-blue-600">Create one</NuxtLink></p>
                      </div>

                      <!-- Move to Project -->
                      <div v-if="action.type === 'move_to_project'">
                        <label class="block text-xs text-gray-500 mb-1">Destination Project</label>
                        <select v-model="action.project_id" class="input text-sm">
                          <option v-for="project in projects" :key="project.id" :value="project.id">{{ project.name }}</option>
                        </select>
                      </div>

                      <!-- Webhook -->
                      <div v-if="action.type === 'webhook'" class="space-y-2">
                        <div>
                          <label class="block text-xs text-gray-500 mb-1">Webhook URL</label>
                          <input v-model="action.webhook_url" type="url" class="input text-sm" placeholder="https://example.com/webhook" />
                        </div>
                        <div>
                          <label class="block text-xs text-gray-500 mb-1">HTTP Method</label>
                          <select v-model="action.webhook_method" class="input text-sm">
                            <option value="POST">POST</option>
                            <option value="PUT">PUT</option>
                            <option value="PATCH">PATCH</option>
                          </select>
                        </div>
                        <p class="text-xs text-gray-400">Task data will be sent as JSON payload</p>
                      </div>
                    </div>
                  </div>
                  <button type="button" @click="removeAction(index)" class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <button type="button" @click="addAction" class="text-sm text-green-700 dark:text-green-400 hover:underline flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Action
              </button>
            </div>
          </div>

          <!-- Enable/Disable -->
          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2">
              <input
                v-model="automationForm.is_enabled"
                type="checkbox"
                class="rounded"
              />
              <span class="text-sm">Enable this automation</span>
            </label>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" @click="closeAutomationModal" class="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving || automationForm.actions.length === 0">
              {{ saving ? 'Saving...' : 'Save Automation' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const { apiFetch } = useApi()

// Data refs
const automations = ref<any[]>([])
const statuses = ref<any[]>([])
const users = ref<any[]>([])
const projects = ref<any[]>([])
const products = ref<any[]>([])
const labels = ref<any[]>([])
const teams = ref<any[]>([])
const agencies = ref<any[]>([])
const approvalWorkflows = ref<any[]>([])

// UI state
const loading = ref(false)
const saving = ref(false)
const showAutomationModal = ref(false)
const editingAutomation = ref<any>(null)

// Form
const automationForm = ref({
  name: '',
  trigger: {
    type: 'task_created'
  } as any,
  conditions: [] as any[],
  condition_logic: 'all',
  actions: [] as any[],
  is_enabled: true
})

// Trigger type labels for display
const triggerLabels: Record<string, string> = {
  task_created: 'Task is created',
  task_updated: 'Task is updated',
  task_deleted: 'Task is deleted',
  status_changed: 'Status changes',
  status_changed_to: 'Status changes to',
  status_changed_from: 'Status changes from',
  assignee_changed: 'Assignee changes',
  task_assigned: 'Task is assigned',
  task_unassigned: 'Task is unassigned',
  due_date_approaching: 'Due date approaching',
  due_date_passed: 'Due date passed (overdue)',
  due_date_set: 'Due date is set',
  priority_changed: 'Priority changes',
  priority_set_high: 'Priority set to High/Urgent',
  comment_added: 'Comment is added',
  attachment_added: 'Attachment is added',
  watcher_added: 'Watcher is added',
  label_added: 'Label is added',
  approval_requested: 'Approval is requested',
  approval_approved: 'Approval is approved',
  approval_rejected: 'Approval is rejected',
  sla_warning: 'SLA warning threshold reached',
  sla_breached: 'SLA is breached',
  schedule_daily: 'Daily schedule',
  schedule_weekly: 'Weekly schedule'
}

// Action type labels for display
const actionLabels: Record<string, string> = {
  change_status: 'Change Status',
  change_assignee: 'Change Assignee',
  change_priority: 'Change Priority',
  set_due_date: 'Set Due Date',
  clear_due_date: 'Clear Due Date',
  add_label: 'Add Label',
  remove_label: 'Remove Label',
  clear_labels: 'Clear All Labels',
  add_watcher: 'Add Watcher',
  remove_watcher: 'Remove Watcher',
  add_comment: 'Add Comment',
  send_email: 'Send Email',
  send_notification: 'Send Notification',
  create_subtask: 'Create Subtask',
  trigger_approval: 'Trigger Approval',
  move_to_project: 'Move to Project',
  webhook: 'Call Webhook'
}

// Computed
const triggerNeedsStatus = computed(() => {
  return ['status_changed', 'status_changed_to', 'status_changed_from'].includes(automationForm.value.trigger.type)
})

// Helper functions
const getFieldType = (field: string): string => {
  const selectFields = ['status_id', 'priority', 'assignee_id', 'project_id', 'product_id', 'team_id', 'agency_id', 'has_label']
  const booleanFields = ['has_assignee', 'has_due_date']
  const dateFields = ['due_date', 'created_at']
  
  if (selectFields.includes(field)) return 'select'
  if (booleanFields.includes(field)) return 'boolean'
  if (dateFields.includes(field)) return 'date'
  return 'text'
}

const formatTriggerDisplay = (trigger: any): string => {
  if (typeof trigger === 'string') return trigger
  const label = triggerLabels[trigger?.type] || trigger?.type || 'Unknown'
  
  // Add details for status changes
  if (trigger?.type === 'status_changed_to' && trigger.to_status_id) {
    const status = statuses.value.find(s => s.id === trigger.to_status_id)
    return `${label} "${status?.name || 'Unknown'}"`
  }
  if (trigger?.type === 'status_changed_from' && trigger.from_status_id) {
    const status = statuses.value.find(s => s.id === trigger.from_status_id)
    return `${label} "${status?.name || 'Unknown'}"`
  }
  if (trigger?.type === 'due_date_approaching' && trigger.days_before) {
    return `${label} (${trigger.days_before} days before)`
  }
  
  return label
}

const formatConditionsDisplay = (conditions: any[]): string => {
  if (!conditions || conditions.length === 0) return ''
  return `${conditions.length} condition(s)`
}

const formatActionsDisplay = (actions: any[]): string => {
  if (!actions || actions.length === 0) return 'No actions'
  return actions.map(a => actionLabels[a.type] || a.type).join(', ')
}

// Event handlers
const onTriggerTypeChange = () => {
  // Reset trigger-specific fields when type changes
  const newTrigger: any = { type: automationForm.value.trigger.type }
  automationForm.value.trigger = newTrigger
}

const onConditionFieldChange = (condition: any) => {
  // Reset operator and value when field changes
  const fieldType = getFieldType(condition.field)
  if (fieldType === 'boolean') {
    condition.operator = 'is_true'
  } else if (fieldType === 'select') {
    condition.operator = 'equals'
  } else {
    condition.operator = 'equals'
  }
  condition.value = ''
}

const onActionTypeChange = (action: any) => {
  // Keep only the type, reset all other fields
  const type = action.type
  Object.keys(action).forEach(key => {
    if (key !== 'type') delete action[key]
  })
  action.type = type
  
  // Set default values based on action type
  if (type === 'set_due_date') {
    action.due_date_type = 'relative'
  }
  if (type === 'send_email') {
    action.email_recipient = 'assignee'
  }
  if (type === 'send_notification') {
    action.notify_recipient = 'assignee'
  }
  if (type === 'webhook') {
    action.webhook_method = 'POST'
  }
}

// Data loading
const loadAutomations = async () => {
  loading.value = true
  try {
    const response = await apiFetch('/automations')
    automations.value = response.data || []
  } catch (error) {
    console.error('Failed to load automations:', error)
    automations.value = []
  } finally {
    loading.value = false
  }
}

const loadStatuses = async () => {
  try {
    const response = await apiFetch('/statuses')
    statuses.value = response.data || []
  } catch (error) {
    console.error('Failed to load statuses:', error)
  }
}

const loadUsers = async () => {
  try {
    const response = await apiFetch('/users')
    users.value = response.data || []
  } catch (error) {
    console.error('Failed to load users:', error)
  }
}

const loadProjects = async () => {
  try {
    const response = await apiFetch('/projects')
    projects.value = response.data || []
  } catch (error) {
    console.error('Failed to load projects:', error)
  }
}

const loadProducts = async () => {
  try {
    const response = await apiFetch('/products')
    products.value = response.data || []
  } catch (error) {
    console.error('Failed to load products:', error)
  }
}

const loadLabels = async () => {
  try {
    const response = await apiFetch('/labels')
    labels.value = response.data || []
  } catch (error) {
    console.error('Failed to load labels:', error)
  }
}

const loadTeams = async () => {
  try {
    const response = await apiFetch('/teams')
    teams.value = response.data || []
  } catch (error) {
    console.error('Failed to load teams:', error)
  }
}

const loadAgencies = async () => {
  try {
    const response = await apiFetch('/agencies')
    agencies.value = response.data || []
  } catch (error) {
    console.error('Failed to load agencies:', error)
  }
}

const loadApprovalWorkflows = async () => {
  try {
    const response = await apiFetch('/approval-workflows')
    approvalWorkflows.value = response.data || []
  } catch (error) {
    console.error('Failed to load approval workflows:', error)
  }
}

// Modal handlers
const openAutomationModal = (automation?: any) => {
  editingAutomation.value = automation
  if (automation) {
    automationForm.value = {
      name: automation.name || '',
      trigger: automation.trigger || { type: 'task_created' },
      conditions: automation.conditions || [],
      condition_logic: automation.condition_logic || 'all',
      actions: automation.actions || [],
      is_enabled: automation.is_enabled !== false
    }
  } else {
    automationForm.value = {
      name: '',
      trigger: { type: 'task_created' },
      conditions: [],
      condition_logic: 'all',
      actions: [],
      is_enabled: true
    }
  }
  showAutomationModal.value = true
}

const closeAutomationModal = () => {
  showAutomationModal.value = false
  editingAutomation.value = null
  automationForm.value = {
    name: '',
    trigger: { type: 'task_created' },
    conditions: [],
    condition_logic: 'all',
    actions: [],
    is_enabled: true
  }
}

// Condition handlers
const addCondition = () => {
  automationForm.value.conditions.push({
    field: 'status_id',
    operator: 'equals',
    value: ''
  })
}

const removeCondition = (index: number) => {
  automationForm.value.conditions.splice(index, 1)
}

// Action handlers
const addAction = () => {
  automationForm.value.actions.push({
    type: 'change_status'
  })
}

const removeAction = (index: number) => {
  automationForm.value.actions.splice(index, 1)
}

// Save automation
const saveAutomation = async () => {
  if (automationForm.value.actions.length === 0) {
    alert('Please add at least one action')
    return
  }

  saving.value = true
  try {
    if (editingAutomation.value) {
      await apiFetch(`/automations/${editingAutomation.value.id}`, {
        method: 'PATCH',
        body: automationForm.value
      })
    } else {
      await apiFetch('/automations', {
        method: 'POST',
        body: automationForm.value
      })
    }
    await loadAutomations()
    closeAutomationModal()
  } catch (error) {
    console.error('Failed to save automation:', error)
    alert('Failed to save automation')
  } finally {
    saving.value = false
  }
}

// Toggle automation
const toggleAutomation = async (automation: any) => {
  try {
    await apiFetch(`/automations/${automation.id}`, {
      method: 'PATCH',
      body: { is_enabled: !automation.is_enabled }
    })
    await loadAutomations()
  } catch (error) {
    console.error('Failed to toggle automation:', error)
    alert('Failed to toggle automation')
  }
}

// Delete automation
const deleteAutomation = async (id: string) => {
  if (!confirm('Are you sure you want to delete this automation?')) return
  
  try {
    await apiFetch(`/automations/${id}`, {
      method: 'DELETE'
    })
    await loadAutomations()
  } catch (error) {
    console.error('Failed to delete automation:', error)
    alert('Failed to delete automation')
  }
}

// Initialize
onMounted(() => {
  if (!authStore.canManageSettings) {
    navigateTo('/')
    return
  }
  // Load all data in parallel
  Promise.all([
    loadAutomations(),
    loadStatuses(),
    loadUsers(),
    loadProjects(),
    loadProducts(),
    loadLabels(),
    loadTeams(),
    loadAgencies(),
    loadApprovalWorkflows()
  ])
})
</script>

